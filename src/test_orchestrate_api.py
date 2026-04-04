import json
import os
from datetime import datetime, timedelta

import requests


DJANGO_BASE_URL = os.getenv("DJANGO_BASE_URL", "http://127.0.0.1:8001")
ORCHESTRATE_URL = f"{DJANGO_BASE_URL}/api/transactions/orchestrate/"
API_TOKEN = os.getenv("CAMPUS_API_TOKEN", "")


def build_demo_payload() -> dict:
    now = datetime.utcnow().replace(microsecond=0)
    purchase_time = now.strftime("%Y-%m-%d %H:%M:%S")

    return {
        "source_type": "manual",
        "device_id": "judge-demo-device-01",
        "ip_address": "192.168.1.10",
        "amount": "1200.50",
        "purchase_time": purchase_time,
        "age": 21,
        "continue_on_gaps": True,
    }


def summarize_response(status_code: int, data: dict) -> None:
    print(f"HTTP Status: {status_code}")

    verification = data.get("verification", {})
    summary = verification.get("summary", {})
    missing = verification.get("missing", [])

    print("\n=== Verification Summary ===")
    print(f"Status: {verification.get('status', 'unknown')}")
    print(f"Required Present: {summary.get('required_present', 0)}")
    print(f"Required Missing: {summary.get('required_missing', 0)}")
    if missing:
        print("Missing Components:")
        for item in missing:
            print(f"- {item.get('name')}: {item.get('details')}")

    execution = data.get("execution", {})
    print("\n=== Execution Summary ===")
    print(f"Execution Status: {execution.get('status', 'unknown')}")

    result = execution.get("result", {})
    fraud = result.get("fraud_assessment", {})
    analysis = result.get("analysis", {})

    if fraud:
        print("\n=== Fraud Output ===")
        print(f"Prediction: {fraud.get('prediction')}")
        print(f"Fraud Probability: {fraud.get('fraud_probability')}")
        print(f"Risk Level: {fraud.get('risk_level')}")

    if analysis:
        print("\n=== Confidence & Reasoning ===")
        print(f"OCR Reliability: {analysis.get('ocr_reliability')}")
        print(f"Source Confidence: {analysis.get('source_confidence')}")
        print(f"Behavioral Flags: {analysis.get('behavioral_flags')}")
        reasoning = analysis.get("confidence_reasoning", {})
        print(f"Reasoning: {json.dumps(reasoning)}")


def main() -> None:
    payload = build_demo_payload()
    headers = {"Content-Type": "application/json"}
    if API_TOKEN:
        headers["Authorization"] = f"Bearer {API_TOKEN}"

    print(f"Calling: {ORCHESTRATE_URL}")
    print(f"Payload: {json.dumps(payload)}")

    try:
        response = requests.post(ORCHESTRATE_URL, json=payload, headers=headers, timeout=20)
    except requests.RequestException as exc:
        print(f"Request failed: {exc}")
        return

    try:
        body = response.json()
    except ValueError:
        print("Response was not JSON:")
        print(response.text)
        return

    summarize_response(response.status_code, body)

    print("\n=== Full JSON ===")
    print(json.dumps(body, indent=2))


if __name__ == "__main__":
    main()
