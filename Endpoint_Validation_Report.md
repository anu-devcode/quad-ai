# Endpoint Validation Report

Generated: 2026-04-05T06:20:46.414978+00:00

Summary: 16/16 checks passed, 0 failed

| Endpoint | Method | Path | Status | Expected | Result |
|---|---|---|---:|---|---|
| verification_report | GET | /api/verification/report/ | 200 | 200 | PASS |
| predict_proxy | POST | /api/predict/ | 200 | 200,503 | PASS |
| transactions_list | GET | /api/transactions/ | 200 | 200 | PASS |
| transactions_dashboard_stats | GET | /api/transactions/dashboard-stats/ | 200 | 200 | PASS |
| transactions_ingest | POST | /api/transactions/ingest/ | 201 | 201 | PASS |
| transactions_orchestrate | POST | /api/transactions/orchestrate/ | 201 | 200,201 | PASS |
| transactions_ingest_sms | POST | /api/transactions/ingest/ | 201 | 201 | PASS |
| transactions_upload_sms | POST | /api/transactions/upload/ | 201 | 201 | PASS |
| transactions_detail | GET | /api/transactions/15/ | 200 | 200 | PASS |
| loan_create | POST | /api/loans/requests/ | 202 | 202 | PASS |
| loan_list | GET | /api/loans/requests/ | 200 | 200 | PASS |
| loan_detail | GET | /api/loans/requests/5/ | 200 | 200 | PASS |
| loan_status | GET | /api/loans/requests/5/status/ | 200 | 200 | PASS |
| loan_evaluate | POST | /api/loans/requests/5/evaluate/ | 200 | 200 | PASS |
| loan_approve | POST | /api/loans/requests/5/approve/ | 200 | 200 | PASS |
| loan_reject_after_approve | POST | /api/loans/requests/5/reject/ | 400 | 400 | PASS |

## Response Samples

- verification_report (200): {"status": "ready", "summary": {"required_total": 6, "required_present": 6, "required_missing": 0, "optional_missing": 0}, "present": [{"name": "django_backend_structure", "required": true, "present": true, "details": "Checks payments model
- predict_proxy (200): {"prediction": 1, "fraud_probability": 0.56, "legitimate_probability": 0.44, "risk_level": "High", "model_source": "fastapi-random-forest"}
- transactions_list (200): [{"id": 12, "user": {"id": 5, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT-001", "full_name": "", "sex": "M", "age": 24, "phone_number": null, "city_region": "", "financial_institutions"
- transactions_dashboard_stats (200): {"total_transactions": 0, "completed_count": 0, "pending_count": 0, "rejected_count": 0, "flagged_count": 0, "risk_distribution": {"low": 0, "medium": 0, "high": 0}, "overall_score": 680, "data_quality": 78, "risk_level": "Unknown", "comput
- transactions_ingest (201): {"id": 15, "user": {"id": 5, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT-001", "full_name": "", "sex": "M", "age": 24, "phone_number": null, "city_region": "", "financial_institutions":
- transactions_orchestrate (201): {"verification": {"status": "ready", "summary": {"required_total": 6, "required_present": 6, "required_missing": 0, "optional_missing": 0}, "present": [{"name": "django_backend_structure", "required": true, "present": true, "details": "Chec
- transactions_ingest_sms (201): {"id": 17, "user": {"id": 6, "username": "portal_251911777777", "email": "", "student_id": "PTL-251911777777", "full_name": "SMS Validation User", "sex": "Other", "age": 24, "phone_number": "+251911777777", "city_region": "", "financial_ins
- transactions_upload_sms (201): {"parsed_data": {"transaction_id": 18, "source": "sms", "amount": "3250.75", "purchase_time": "2026-04-05T06:20:45.933057Z", "status": "flagged"}, "fraud_score": 0.69, "risk_level": "Medium", "raw_result": {"id": 18, "user": {"id": 7, "user
- transactions_detail (200): {"id": 15, "user": {"id": 5, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT-001", "full_name": "", "sex": "M", "age": 24, "phone_number": null, "city_region": "", "financial_institutions":
- loan_create (202): {"message": "Loan request accepted for asynchronous evaluation.", "request_id": 5, "status": "submitted", "data": {"id": 5, "user": {"id": 5, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT
- loan_list (200): [{"id": 5, "user": {"id": 5, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT-001", "full_name": "", "sex": "M", "age": 24, "phone_number": null, "city_region": "", "financial_institutions":
- loan_detail (200): {"id": 5, "user": {"id": 5, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT-001", "full_name": "", "sex": "M", "age": 24, "phone_number": null, "city_region": "", "financial_institutions": 
- loan_status (200): {"id": 5, "status": "submitted", "ai_recommendation": null, "ai_risk_level": null, "ai_score": null, "evaluated_at": null, "decided_at": null}
- loan_evaluate (200): {"id": 5, "user": {"id": 5, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT-001", "full_name": "", "sex": "M", "age": 24, "phone_number": null, "city_region": "", "financial_institutions": 
- loan_approve (200): {"id": 5, "user": {"id": 5, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT-001", "full_name": "", "sex": "M", "age": 24, "phone_number": null, "city_region": "", "financial_institutions": 
- loan_reject_after_approve (400): {"detail": "Approved request cannot be rejected."}