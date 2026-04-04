from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


def body_preview(resp):
    try:
        payload = resp.json()
        text = json.dumps(payload)
        return text[:240]
    except Exception:
        return (resp.content or b"").decode("utf-8", errors="ignore")[:240]


def record(results, name, method, path, status, ok_codes, preview):
    results.append(
        {
            "name": name,
            "method": method,
            "path": path,
            "status": status,
            "ok": status in ok_codes,
            "ok_codes": sorted(list(ok_codes)),
            "preview": preview,
        }
    )


def run():
    client = APIClient()
    User = get_user_model()

    user, _ = User.objects.get_or_create(
        username="endpoint_tester",
        defaults={
            "email": "endpoint.tester@example.com",
            "student_id": "STU-ENDPOINT-001",
            "sex": "M",
            "age": 24,
            "is_active": True,
        },
    )

    now_iso = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    results = []

    # 1) Verification
    resp = client.get("/api/verification/report/")
    record(results, "verification_report", "GET", "/api/verification/report/", resp.status_code, {200}, body_preview(resp))

    # 2) Predict proxy (may be 503 if FastAPI is not running)
    predict_payload = {
        "user_id": user.id,
        "signup_time": now_iso,
        "purchase_time": now_iso,
        "purchase_value": "120.50",
        "age": user.age or 20,
        "ip_address": "127.0.0.1",
        "user_transaction_count": 1,
        "device_transaction_count": 1,
        "source_type": "manual",
        "device_id": "device-api-validation-01",
        "parsing_success": 1.0,
        "source_confidence": 0.9,
    }
    resp = client.post("/api/predict/", data=predict_payload, format="json")
    record(results, "predict_proxy", "POST", "/api/predict/", resp.status_code, {200, 503}, body_preview(resp))

    # 3) Transactions list + dashboard
    resp = client.get("/api/transactions/")
    record(results, "transactions_list", "GET", "/api/transactions/", resp.status_code, {200}, body_preview(resp))

    resp = client.get("/api/transactions/dashboard-stats/")
    record(results, "transactions_dashboard_stats", "GET", "/api/transactions/dashboard-stats/", resp.status_code, {200}, body_preview(resp))

    # 4) Ingest + orchestrate
    ingest_payload = {
        "source_type": "manual",
        "device_id": "device-api-validation-02",
        "ip_address": "127.0.0.1",
        "amount": "300.00",
        "purchase_time": now_iso,
        "age": user.age or 20,
        "user_id": user.id,
    }
    resp = client.post("/api/transactions/ingest/", data=ingest_payload, format="json")
    record(results, "transactions_ingest", "POST", "/api/transactions/ingest/", resp.status_code, {201}, body_preview(resp))
    transaction_id = None
    try:
        transaction_id = resp.json().get("id")
    except Exception:
        transaction_id = None

    orch_payload = {
        "source_type": "manual",
        "device_id": "device-api-validation-03",
        "ip_address": "127.0.0.1",
        "amount": "450.00",
        "purchase_time": now_iso,
        "age": user.age or 20,
        "user_id": user.id,
        "continue_on_gaps": True,
    }
    resp = client.post("/api/transactions/orchestrate/", data=orch_payload, format="json")
    record(results, "transactions_orchestrate", "POST", "/api/transactions/orchestrate/", resp.status_code, {200, 201}, body_preview(resp))

    if transaction_id:
        resp = client.get(f"/api/transactions/{transaction_id}/")
        record(results, "transactions_detail", "GET", f"/api/transactions/{transaction_id}/", resp.status_code, {200}, body_preview(resp))

    # 5) Loan workflow
    loan_payload = {
        "user_id": user.id,
        "requested_amount": "1000.00",
        "requested_tenure_months": 12,
        "stated_income": "2500.00",
        "purpose": "fees",
    }
    resp = client.post("/api/loans/requests/", data=loan_payload, format="json")
    record(results, "loan_create", "POST", "/api/loans/requests/", resp.status_code, {202}, body_preview(resp))

    loan_id = None
    try:
        payload = resp.json()
        loan_id = payload.get("request_id")
    except Exception:
        loan_id = None

    resp = client.get("/api/loans/requests/")
    record(results, "loan_list", "GET", "/api/loans/requests/", resp.status_code, {200}, body_preview(resp))

    if loan_id:
        resp = client.get(f"/api/loans/requests/{loan_id}/")
        record(results, "loan_detail", "GET", f"/api/loans/requests/{loan_id}/", resp.status_code, {200}, body_preview(resp))

        resp = client.get(f"/api/loans/requests/{loan_id}/status/")
        record(results, "loan_status", "GET", f"/api/loans/requests/{loan_id}/status/", resp.status_code, {200}, body_preview(resp))

        resp = client.post(f"/api/loans/requests/{loan_id}/evaluate/", data={"ip_address": "127.0.0.1"}, format="json")
        record(results, "loan_evaluate", "POST", f"/api/loans/requests/{loan_id}/evaluate/", resp.status_code, {200}, body_preview(resp))

        resp = client.post(f"/api/loans/requests/{loan_id}/approve/", data={"note": "approved in validation run"}, format="json")
        record(results, "loan_approve", "POST", f"/api/loans/requests/{loan_id}/approve/", resp.status_code, {200}, body_preview(resp))

        resp = client.post(f"/api/loans/requests/{loan_id}/reject/", data={"note": "should fail after approval"}, format="json")
        record(results, "loan_reject_after_approve", "POST", f"/api/loans/requests/{loan_id}/reject/", resp.status_code, {400}, body_preview(resp))

    passed = sum(1 for x in results if x["ok"])
    total = len(results)
    failed = total - passed

    report_lines = []
    report_lines.append("# Endpoint Validation Report")
    report_lines.append("")
    report_lines.append(f"Generated: {datetime.now(timezone.utc).isoformat()}")
    report_lines.append("")
    report_lines.append(f"Summary: {passed}/{total} checks passed, {failed} failed")
    report_lines.append("")
    report_lines.append("| Endpoint | Method | Path | Status | Expected | Result |")
    report_lines.append("|---|---|---|---:|---|---|")
    for row in results:
        expected = ",".join(str(code) for code in row["ok_codes"])
        result = "PASS" if row["ok"] else "FAIL"
        report_lines.append(
            f"| {row['name']} | {row['method']} | {row['path']} | {row['status']} | {expected} | {result} |"
        )

    report_lines.append("")
    report_lines.append("## Response Samples")
    report_lines.append("")
    for row in results:
        report_lines.append(f"- {row['name']} ({row['status']}): {row['preview']}")

    report_path = Path.cwd().parent / "Endpoint_Validation_Report.md"
    report_path.write_text("\n".join(report_lines), encoding="utf-8")

    print(str(report_path))
    print(f"PASS={passed} FAIL={failed} TOTAL={total}")


run()
