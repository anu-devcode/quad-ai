# Endpoint Validation Report

Generated: 2026-04-04T14:41:13.775484+00:00

Summary: 14/14 checks passed, 0 failed

| Endpoint | Method | Path | Status | Expected | Result |
|---|---|---|---:|---|---|
| verification_report | GET | /api/verification/report/ | 200 | 200 | PASS |
| predict_proxy | POST | /api/predict/ | 503 | 200,503 | PASS |
| transactions_list | GET | /api/transactions/ | 200 | 200 | PASS |
| transactions_dashboard_stats | GET | /api/transactions/dashboard-stats/ | 200 | 200 | PASS |
| transactions_ingest | POST | /api/transactions/ingest/ | 201 | 201 | PASS |
| transactions_orchestrate | POST | /api/transactions/orchestrate/ | 201 | 200,201 | PASS |
| transactions_detail | GET | /api/transactions/8/ | 200 | 200 | PASS |
| loan_create | POST | /api/loans/requests/ | 202 | 202 | PASS |
| loan_list | GET | /api/loans/requests/ | 200 | 200 | PASS |
| loan_detail | GET | /api/loans/requests/2/ | 200 | 200 | PASS |
| loan_status | GET | /api/loans/requests/2/status/ | 200 | 200 | PASS |
| loan_evaluate | POST | /api/loans/requests/2/evaluate/ | 200 | 200 | PASS |
| loan_approve | POST | /api/loans/requests/2/approve/ | 200 | 200 | PASS |
| loan_reject_after_approve | POST | /api/loans/requests/2/reject/ | 400 | 400 | PASS |

## Response Samples

- verification_report (200): {"status": "ready", "summary": {"required_total": 6, "required_present": 6, "required_missing": 0, "optional_missing": 0}, "present": [{"name": "django_backend_structure", "required": true, "present": true, "details": "Checks payments model
- predict_proxy (503): {"detail": "FastAPI Random Forest service is unavailable or did not return a valid prediction.", "endpoint": "http://127.0.0.1:8000/predict"}
- transactions_list (200): [{"id": 7, "user": {"id": 3, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT-001", "full_name": "", "sex": "M", "age": 24, "signup_time": "2026-04-04T14:34:30.593270Z", "is_active": true}, 
- transactions_dashboard_stats (200): {"total_transactions": 7, "flagged_count": 1, "risk_distribution": {"low": 0, "medium": 7, "high": 0}}
- transactions_ingest (201): {"id": 8, "user": {"id": 3, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT-001", "full_name": "", "sex": "M", "age": 24, "signup_time": "2026-04-04T14:34:30.593270Z", "is_active": true}, "
- transactions_orchestrate (201): {"verification": {"status": "ready", "summary": {"required_total": 6, "required_present": 6, "required_missing": 0, "optional_missing": 0}, "present": [{"name": "django_backend_structure", "required": true, "present": true, "details": "Chec
- transactions_detail (200): {"id": 8, "user": {"id": 3, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT-001", "full_name": "", "sex": "M", "age": 24, "signup_time": "2026-04-04T14:34:30.593270Z", "is_active": true}, "
- loan_create (202): {"message": "Loan request accepted for asynchronous evaluation.", "request_id": 2, "status": "submitted", "data": {"id": 2, "user": {"id": 3, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT
- loan_list (200): [{"id": 2, "user": {"id": 3, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT-001", "full_name": "", "sex": "M", "age": 24, "signup_time": "2026-04-04T14:34:30.593270Z", "is_active": true}, 
- loan_detail (200): {"id": 2, "user": {"id": 3, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT-001", "full_name": "", "sex": "M", "age": 24, "signup_time": "2026-04-04T14:34:30.593270Z", "is_active": true}, "
- loan_status (200): {"id": 2, "status": "submitted", "ai_recommendation": null, "ai_risk_level": null, "ai_score": null, "evaluated_at": null, "decided_at": null}
- loan_evaluate (200): {"id": 2, "user": {"id": 3, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT-001", "full_name": "", "sex": "M", "age": 24, "signup_time": "2026-04-04T14:34:30.593270Z", "is_active": true}, "
- loan_approve (200): {"id": 2, "user": {"id": 3, "username": "endpoint_tester", "email": "endpoint.tester@example.com", "student_id": "STU-ENDPOINT-001", "full_name": "", "sex": "M", "age": 24, "signup_time": "2026-04-04T14:34:30.593270Z", "is_active": true}, "
- loan_reject_after_approve (400): {"detail": "Approved request cannot be rejected."}