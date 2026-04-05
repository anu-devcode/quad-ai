# Admin Functionality and Database Coverage Report

Date: 2026-04-05
Project: QUAD AI

## 1) Admin Module Overview

The admin area is mounted under `/admin/*` and includes these functional pages:

1. `/admin/overview` — Control Center
2. `/admin/fraud` — Risk Engine
3. `/admin/review` — Evidence Lab
4. `/admin/users` — User Intelligence
5. `/admin/analytics` — Analytics Hub
6. `/admin/audit` — Audit Trail
7. `/admin/auth` — Admin Authentication (entry gate)

Route protection and admin-only access are enforced by `AdminLayout` and phone whitelist checks.

## 2) Database Tables (Model-to-Table Map)

Main Django models in use and their expected SQL table names:

- `User` -> `payments_user`
- `Transaction` -> `payments_transaction`
- `LoanRequest` -> `payments_loanrequest`
- `FraudAssessment` -> `payments_fraudassessment`
- `TransactionTrust` -> `payments_transactiontrust`
- `ConfidenceScore` -> `payments_confidencescore`
- `ValidationLog` -> `payments_validationlog`
- `Merchant` -> `payments_merchant`
- `ModelInputFeature` -> `v_model_input_features` (database view, unmanaged)

## 3) Page-by-Page Admin Report

### A) `/admin/overview` (Control Center)

What the page is about:
- High-level operational command dashboard for trust/risk/loan activity.

What it shows:
- KPI cards (active verifications, high-risk cases, approval throughput, model flags).
- Queue load gauge, risk mix bars, loan outcomes bars.
- Live feed of loan decisions + flagged transactions.
- Loan signal snapshot list.

Backend endpoints used:
- `GET /api/transactions/dashboard-stats/?admin_view=true&admin_phone=...`
- `GET /api/transactions/?admin_view=true&admin_phone=...`
- `GET /api/loans/requests/?admin_view=true&admin_phone=...`
- `GET /api/admin/model-monitoring/`

Database tables concerned:
- `payments_transaction` (counts, statuses, validation score, source metadata)
- `payments_transactiontrust` (risk distribution via trust metrics)
- `payments_loanrequest` (pipeline and outcomes)
- `payments_user` (loan/transaction user identity)
- `payments_fraudassessment` (model monitoring totals/flagged)
- `payments_confidencescore` (confidence aggregates)
- `payments_validationlog` (included in transaction serializer payload)
- `payments_merchant` (included in transaction serializer payload when present)

---

### B) `/admin/fraud` (Risk Engine)

What the page is about:
- Case-oriented risk triage console (escalate/whitelist/resolve).

What it shows:
- Open/escalated/resolved/whitelisted counts.
- Heat grid.
- Case drawer and prioritized risk case table.

Current data source:
- Local state only (`AdminOpsContext`) persisted in browser `localStorage` key `qued_admin_ops_v1`.
- Not currently loaded from backend API.

Database tables concerned:
- None directly in current implementation (no backend reads/writes from this page yet).

---

### C) `/admin/review` (Evidence Lab)

What the page is about:
- Main operational review workbench for transaction evidence and loan decisions.

What it shows:
- Transaction evidence queue (pending/flagged/resolved).
- Loan queue (submitted/evaluating/evaluated/approved/rejected).
- Rich decision panel with `decision_stats` (risk score, threshold marker, debt ratio, flagged rate, amount-vs-average, top rejection factors).
- Decision audit feed.

Actions available:
- Evaluate loan.
- Approve loan with note.
- Reject loan with note.

Backend endpoints used:
- `GET /api/transactions/?admin_view=true&admin_phone=...`
- `GET /api/loans/requests/?admin_view=true&admin_phone=...`
- `POST /api/loans/requests/{id}/evaluate/?admin_view=true&admin_phone=...`
- `POST /api/loans/requests/{id}/approve/?admin_view=true&admin_phone=...`
- `POST /api/loans/requests/{id}/reject/?admin_view=true&admin_phone=...`

Database tables concerned:
- `payments_loanrequest` (status transitions, decision note, AI outputs)
- `payments_transaction` (evidence queue + evaluation history statistics)
- `payments_user` (actor/owner identity)
- `payments_validationlog` (transaction validation evidence)
- `payments_merchant` (transaction merchant metadata when linked)

---

### D) `/admin/users` (User Intelligence)

What the page is about:
- User-level identity and behavioral intelligence dashboard.

What it shows:
- Profile counts (tracked/verified/needs review).
- Trust gauge, score distribution histogram, trust-vs-risk scatter.
- Searchable identity directory.
- User drilldown: transactions, flagged rate, loan rejection rate, monthly volume, last activity.

Current data source:
- Backend-only (no `AdminOpsContext` dependency now).

Backend endpoint used:
- `GET /api/admin/users/?admin_view=true&admin_phone=...`

Backend-derived intelligence produced:
- Risk/trust score and status labels from:
  - flagged transaction rate
  - rejected loan rate
  - account activity/inactivity
  - active/blocked status

Database tables concerned:
- `payments_user` (identity, role-like classification, active status)
- `payments_transaction` (counts, flagged rates, monthly volume, average transaction)
- `payments_loanrequest` (approved/rejected totals and rates)

---

### E) `/admin/analytics` (Analytics Hub)

What the page is about:
- Executive intelligence layer combining transaction, loan, and model metrics.

What it shows:
- Summary cards (approved reviews, high-risk cases, audit events).
- Trend panels (average validation, fraud probability average, data quality).
- Executive narrative bullet points.
- Recent operations list (loan and transaction events).

Backend endpoints used:
- `GET /api/transactions/dashboard-stats/?admin_view=true&admin_phone=...`
- `GET /api/transactions/?admin_view=true&admin_phone=...`
- `GET /api/loans/requests/?admin_view=true&admin_phone=...`
- `GET /api/admin/model-monitoring/`

Database tables concerned:
- `payments_transaction`
- `payments_transactiontrust`
- `payments_loanrequest`
- `payments_user`
- `payments_fraudassessment`
- `payments_confidencescore`

---

### F) `/admin/audit` (Audit Trail)

What the page is about:
- Timeline of governance-relevant events from loans and transactions.

What it shows:
- Summary counts by event type.
- Filtered event stream (`all`, `loan`, `transaction`).
- Actor, description, timestamp per event.

Backend endpoints used:
- `GET /api/transactions/?admin_view=true&admin_phone=...`
- `GET /api/loans/requests/?admin_view=true&admin_phone=...`

Database tables concerned:
- `payments_transaction`
- `payments_loanrequest`
- `payments_user` (event actor/user identity)

---

### G) `/admin/auth` (Admin Authentication)

What the page is about:
- Gatekeeper for admin console login.

What it shows:
- Phone input and OTP entry flow.
- Rejected state for non-whitelisted phone numbers.

Current source:
- Frontend-only OTP mock flow (`123456` in dev) and in-app phone whitelist checks.

Database tables concerned:
- None directly from this page implementation.

## 4) Admin Data Source Status Matrix

- Fully backend-driven now:
  - `/admin/overview`
  - `/admin/review`
  - `/admin/users`
  - `/admin/analytics`
  - `/admin/audit`

- Still local/mock (not DB-backed yet):
  - `/admin/fraud`
  - `/admin/auth` (auth simulation UI flow)

## 5) Important Scope/Gating Rules

- Transaction and loan list endpoints can return global admin data only when:
  - `admin_view=true`
  - `admin_phone` belongs to server whitelist.
- User governance endpoint (`/api/admin/users/`) now enforces the same admin scope requirement.

## 6) Quick Mapping by Database Table

- `payments_user`:
  - Main concern of `/admin/users`.
  - Referenced across all loan/transaction-driven pages.

- `payments_transaction`:
  - Core in `/admin/overview`, `/admin/review`, `/admin/analytics`, `/admin/audit`.

- `payments_loanrequest`:
  - Core in `/admin/review`, and major in `/admin/overview`, `/admin/analytics`, `/admin/audit`, `/admin/users` (rates).

- `payments_fraudassessment`, `payments_transactiontrust`, `payments_confidencescore`:
  - Aggregated model metrics for `/admin/overview` and `/admin/analytics` via `/api/admin/model-monitoring/`.

- `payments_validationlog`, `payments_merchant`:
  - Supplemental metadata in transaction evidence views.

- `v_model_input_features`:
  - Not directly consumed by current admin pages.

## 7) Functional Interpretation Summary

The admin console currently has a mixed architecture:

- Operational pages (overview/review/users/analytics/audit) are now data-backed and tied to real API + database state.
- Supporting non-operational pages (`/admin/fraud` and `/admin/auth`) remain frontend-driven/local in the current implementation.

This means "admin functionality" is partially production-backed and partially simulation-backed, depending on the page.
