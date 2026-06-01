# Confirmed Fraud Feedback Propagation

## Bug Description
Currently, when an administrator sets the `actual_outcome` of a `FraudFeedbackRecord` to `fraud` or `legitimate` (via the `/api/fraud/feedback/<pk>/actual-outcome/` endpoint), the feedback is saved correctly on the record itself. However, the system fails to propagate this decision to the associated `Transaction` (or `LoanRequest`) and does not trigger trust profile updates or user/admin notifications.

This leaves the "Close the Loop" feedback workflow completely broken: even if a transaction is confirmed as a fraudulent attack, the transaction remains in its default state (e.g., `pending` or `completed`), the user's `UserTrustProfile` trust score is not recalculated to reflect the confirmed fraud, and the system fails to warn the user or document the event in the admin dashboard.

## Expected Behavior
When a `FraudFeedbackRecord` is updated with an `actual_outcome` (either `fraud` or `legitimate`):
1. **For Transactions (`record.source == 'transaction'`)**:
   - If confirmed as **`fraud`**:
     - The corresponding `Transaction.status` must be set to `flagged`.
     - The linked `TransactionTrust.fraud_flag` must be set to `True` and its `risk_level` updated to `High`.
     - The linked `FraudAssessment.prediction` must be set to `1` and its `risk_level` updated to `High`.
   - If confirmed as **`legitimate`**:
     - The corresponding `Transaction.status` must be set to `completed`.
     - The linked `TransactionTrust.fraud_flag` must be set to `False` and its `risk_level` updated to `Low`.
     - The linked `FraudAssessment.prediction` must be set to `0` and its `risk_level` updated to `Low`.
   - In both cases:
     - The associated user's `UserTrustProfile` must be updated/recalculated immediately (using event type `feedback_received`).
     - A user notification (with category `fraud_alert`) and an admin notification (with category `fraud_alert`) must be sent.

2. **For Loan Requests (`record.source == 'loan'`)**:
   - If confirmed as **`fraud`**:
     - The corresponding `LoanRequest.status` must be set to `rejected`, `ai_recommendation` set to `reject`, and `ai_risk_level` set to `High`.
   - If confirmed as **`legitimate`**:
     - The corresponding `LoanRequest.status` must be set to `approved`, `ai_recommendation` set to `approve`, and `ai_risk_level` set to `Low`.
   - In both cases:
     - The associated user's `UserTrustProfile` must be updated/recalculated immediately (using event type `loan_feedback_received`).

Ensure all database saves use appropriate `update_fields` to preserve efficiency and performance.
