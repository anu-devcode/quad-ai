# Reference Plan - Confirmed Fraud Feedback Propagation

## Root Cause Explanation
The `FraudFeedbackService.set_actual_outcome` method only saves the `actual_outcome` and `note` fields on the `FraudFeedbackRecord` model itself. It is implemented as a simple setter that saves the database row, but has no hook to trigger cascading updates to related entities. Consequently, when the admin marks a transaction or loan request feedback record as verified fraud or legitimate, the state transitions are never propagated to the underlying transaction, model assessments, trust profiles, or notifications.

## Conceptual Solution
Modify `FraudFeedbackService.set_actual_outcome` in `campus/payments/services.py`:
1. Check the source of the `FraudFeedbackRecord` (transaction or loan).
2. If transaction:
   - Transition transaction status (`flagged` for fraud, `completed` for legitimate).
   - Upsert/update `TransactionTrust` and `FraudAssessment` models to match the confirmed state (prediction=1/True and risk=High for fraud; prediction=0/False and risk=Low for legitimate).
   - Recalculate the associated user's trust profile by invoking `TrustProfileService.update_user_profile` with `event_type='feedback_received'`.
   - Dispatch user and admin notifications notifying them of the status adjustment using `NotificationEngine.notify_user` and `NotificationEngine.notify_admin`.
3. If loan:
   - Transition loan request status (`rejected` for fraud, `approved` for legitimate) and update AI recommendations and risk levels.
   - Recalculate user trust profile with `event_type='loan_feedback_received'`.

## Test Plan
Add test assertions verifying that:
- Triggering the actual-outcome endpoint with `actual_outcome='fraud'` results in transaction transitioning to `flagged`, trust metrics to `High`, assessment to prediction `1`, trust profile trust score dropping, and notifications generated.
- Triggering with `actual_outcome='legitimate'` corrects a previously flagged transaction back to `completed`, trust metrics to `Low`, and resets user trust profile flagged transactions.
