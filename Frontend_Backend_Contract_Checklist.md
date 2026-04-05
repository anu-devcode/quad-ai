# Frontend-Backend Contract Checklist

Date: 2026-04-05

## Overall Status
Partially matched.

- User transaction flows: matched and user-scoped.
- User loan submission/list flow: now matched and user-scoped.
- Admin review/operations screens: still partially mock/context-based.

## Matched Flows

1. Transaction ingestion and orchestration
- Frontend: `POST /api/transactions/orchestrate/`
- Backend: `TransactionViewSet.orchestrate`
- Status: Matched.
- Notes: Supports file/SMS/manual payloads and scoped identity (`external_user_key` / `user_id`).

2. User transaction list
- Frontend: `GET /api/transactions/?external_user_key=<phone>`
- Backend: `TransactionViewSet.get_queryset`
- Status: Matched.
- Notes: Non-staff users are filtered to their own records.

3. User dashboard stats
- Frontend: `GET /api/transactions/dashboard-stats/?external_user_key=<phone>`
- Backend: `TransactionViewSet.dashboard_stats`
- Status: Matched.
- Notes: Stats are computed from scoped queryset.

4. User loan create
- Frontend: `POST /api/loans/requests/`
- Backend: `LoanRequestViewSet.create`
- Status: Matched.
- Notes: Frontend now sends backend-supported fields: `requested_amount`, `requested_tenure_months`, `stated_income`, `purpose`, `external_user_key`.

5. User loan list
- Frontend: `GET /api/loans/requests/?external_user_key=<phone>`
- Backend: `LoanRequestViewSet.get_queryset`
- Status: Matched.
- Notes: Scoped to resolved user.

## Still Not Fully Matched

1. User portal home/trust pages
- Current source: local context and static UI data.
- Not yet mapped to backend endpoints.

2. Admin review and admin dashboard pages
- Current source: `VerificationContext` and local/mock structures.
- Backend has admin endpoints (`/api/admin/users/`, `/api/admin/model-monitoring/`) but no full API replacement yet for all review cards/tables currently shown in admin pages.

3. Loan decision actions in UI
- Backend supports evaluate/approve/reject endpoints.
- Frontend currently does not fully use these in admin screens.

## Changes Completed in This Update

- Added serializer compatibility for scoped identity and manual ingestion fields:
  - `TransactionUploadSerializer` now accepts optional `user_id`, `external_user_key`, `owner_name`, `age`, `amount`, `purchase_time`, `continue_on_gaps`.
  - `LoanRequestCreateSerializer` now accepts optional write-only `user_id`, `external_user_key`.
- Connected `DashboardLoan` to backend loan APIs (create + list).
- Kept user scoping on transaction and loan list/stats calls.

## Recommended Next Step

Implement API-backed admin review pages and map existing admin UI cards/tables to real backend datasets (loan decisions, verification queues, and event timelines) so the entire frontend is backend-driven.
