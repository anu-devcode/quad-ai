# Campus Pay Frontend Report

Date: 2026-04-04

## Executive Summary
The most effective frontend for this system is an operations-focused web app with two main areas:

1. Risk Operations Dashboard (for admin/analyst users)
2. Transaction Intake Workspace (for staff/support users)

This aligns with the existing backend APIs, transaction model, fraud assessment flow, and verification/reporting endpoints.

## Backend-Driven Evidence
- Root API mount: `/api/`
- Endpoints available for:
  - Prediction
  - Project verification report
  - Transaction list/detail
  - Transaction ingestion/orchestration
  - Dashboard statistics
- Data model supports:
  - Transaction status lifecycle
  - OCR/source metadata
  - Confidence/trust/risk artifacts
  - Validation logs
  - Fraud assessments

## Recommended Frontend Structure

### 1) System Health / Readiness Page
Purpose: Show whether required backend components are available before processing transactions.

Data source:
- `GET /api/verification/report/`

UI sections:
- Status badge: `ready` or `gaps_found`
- Required checks table (present vs missing)
- Next actions checklist

### 2) Live Fraud Overview Dashboard
Purpose: Monitoring at a glance.

Data source:
- `GET /api/transactions/dashboard-stats/`

UI sections:
- KPI cards:
  - Total transactions
  - Flagged count
  - Flagged rate
- Risk distribution visualization:
  - Low
  - Medium
  - High

### 3) Transaction Intake + Scoring Workspace
Purpose: Single place to submit and score manual/SMS/PDF/screenshot transactions.

Data sources:
- `POST /api/transactions/ingest/`
- `POST /api/transactions/orchestrate/`

UI sections:
- Source selector: `manual`, `sms`, `pdf`, `screenshot`
- Contextual form inputs based on source type
- Option: "Run verification first"
- Result panel:
  - prediction
  - fraud_probability
  - risk_level
  - behavioral flags
  - confidence reasoning
  - model source

### 4) Transactions Explorer
Purpose: Search and investigate transaction history.

Data source:
- `GET /api/transactions/`
- `GET /api/transactions/{id}/`

UI sections:
- Filterable table:
  - status
  - data_source
  - date range
  - risk level
- Row expansion for:
  - validation logs
  - trust metrics
  - fraud assessment

### 5) Transaction Detail (Case View)
Purpose: Deep-dive case analysis.

UI sections:
- Timeline of transaction lifecycle
- Device/IP/source metadata
- Confidence and risk explanation
- Validation outcomes and flags

### 6) Loan Request + Admin Approval Workflow (New)
Purpose: Let users submit loan requests, continue with other tasks immediately, then receive AI/admin decisions asynchronously.

Proposed data sources (to be added in backend):
- `POST /api/loans/requests/`
- `GET /api/loans/requests/`
- `GET /api/loans/requests/{id}/`
- `GET /api/loans/requests/{id}/status/`
- `POST /api/loans/requests/{id}/evaluate/` (internal/admin or background worker trigger)
- `POST /api/loans/requests/{id}/approve/`
- `POST /api/loans/requests/{id}/reject/`

Recommended non-blocking behavior:
- `POST /api/loans/requests/` returns `202 Accepted` with a `request_id` and initial `status="submitted"`.
- AI evaluation runs in background (queue/worker) and updates status to `evaluated`.
- User keeps using the app; frontend checks `GET /api/loans/requests/{id}/status/` (polling) or receives push notifications.
- Admin reviews evaluated requests and sets final decision: `approved` or `rejected`.

UI sections:
- User loan form:
  - requested_amount
  - requested_tenure_months
  - stated_income
  - purpose
- AI evaluation result panel:
  - ai_recommendation (`approve` or `reject`)
  - ai_risk_level
  - ai_score/confidence
  - decision_reasoning
- Admin decision panel:
- current status (`submitted`, `evaluating`, `evaluated`, `approved`, `rejected`)
  - approve/reject actions
  - admin decision note
  - decision timestamp and actor

User experience requirement (non-blocking):
- After submit, redirect user to normal app flow (dashboard/payments/history) with a "Loan request received" banner.
- Show loan status chip in header/profile and in `/loans` list.
- Notify user when status changes (in-app toast, notification center, email/SMS optional).

## UX and Product Priorities
1. Fast operator flow
- Minimize clicks to ingest and assess
- Immediate visibility into why a transaction was flagged

2. Explainability-first
- Display confidence reasoning clearly
- Surface OCR/parsing reliability impact

3. Risk-first visual language
- High risk: red
- Medium risk: amber
- Low risk: green

4. Data quality transparency
- Show parsing success and validation score prominently

## Core API-to-UI Mapping
- `GET /api/verification/report/` -> System readiness card + checklist
- `GET /api/transactions/dashboard-stats/` -> KPI cards + risk distribution chart
- `POST /api/transactions/orchestrate/` -> One-click verify + ingest + score flow
- `POST /api/transactions/ingest/` -> Direct ingestion flow
- `GET /api/transactions/` -> Explorer table
- `GET /api/transactions/{id}/` -> Case detail
- `POST /api/predict/` -> Optional advanced model testing panel
- `POST /api/loans/requests/` -> User submits loan request
- `GET /api/loans/requests/` -> Loan queue for admin and user history
- `GET /api/loans/requests/{id}/` -> Loan request detail view
- `GET /api/loans/requests/{id}/status/` -> Lightweight async status check for user UI
- `POST /api/loans/requests/{id}/evaluate/` -> Trigger/execute AI eligibility in background flow
- `POST /api/loans/requests/{id}/approve/` -> Admin approve action
- `POST /api/loans/requests/{id}/reject/` -> Admin reject action

## Information Architecture (Suggested Routes)
1. `/overview`
2. `/intake`
3. `/transactions`
4. `/transactions/:id`
5. `/system`
6. `/loans/new`
7. `/loans`
8. `/loans/:id`
9. `/admin/loans`

## Priority Data Fields for UI
- `status`
- `data_source`
- `source_confidence`
- `parsing_success`
- `validation_score`
- `fraud_assessment.prediction`
- `fraud_assessment.fraud_probability`
- `fraud_assessment.risk_level`
- `analysis.behavioral_flags`
- `analysis.confidence_reasoning`

## Implementation Recommendation
Since frontend source is currently empty, start with:
- React + TypeScript
- Route-based app shell
- API client layer with typed contracts
- Chart component for risk distribution
- Reusable components:
  - RiskBadge
  - ConfidenceMeter
  - VerificationChecklist
  - TransactionTable
  - IngestForm

## Delivery Phases
Phase 1:
- Overview
- System readiness
- Manual intake and scoring
- User loan request form (`/loans/new`)
- Async submit UX: request accepted state, immediate redirect, status chip

Phase 2:
- Full source-type intake (sms/pdf/screenshot)
- Transaction explorer
- Detail case page
- Loan queue and loan detail views (`/loans`, `/loans/:id`)
- AI evaluation background workflow + status polling endpoint

Phase 3:
- UX polish
- Enhanced filters
- Export/audit helpers
- Admin decision workflow (`approve`/`reject`) and decision audit timeline
- Real-time updates (WebSocket/SSE) and notification center for decision changes

## Backend Delta Needed for Loan Flow
To support the endpoints above, add:
- Loan request model with fields for amount, tenure, purpose, status, AI output, and admin decision metadata.
- Loan serializers and viewset/actions for evaluate/approve/reject.
- Async processing stack (Celery/RQ + Redis or equivalent) for non-blocking AI evaluation.
- Status endpoint and optional push channel (WebSocket/SSE) for live updates.
- Django admin registration for loan request management.
- Optional dashboard stats endpoint for loan approvals/rejections and pending queue.

## Final Recommendation
Build an analyst-focused console that prioritizes operational speed, transparent risk reasoning, and reliable ingestion flows. The backend already supports this architecture well, so the frontend should focus on clarity, explainability, and efficient investigation workflows.
