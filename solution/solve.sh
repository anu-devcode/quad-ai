#!/bin/bash
set -e

# Apply the patch that fixes the FraudFeedbackService.set_actual_outcome method
# to cascade transaction/loan status, assessments, trust profiles, and notifications.

cd /app

cat << 'PATCH_EOF' | git apply -
diff --git a/campus/payments/services.py b/campus/payments/services.py
index d521d15..7ded6a3 100644
--- a/campus/payments/services.py
+++ b/campus/payments/services.py
@@ -481,6 +481,88 @@ class FraudFeedbackService:
         if note is not None:
             record.note = note
         record.save(update_fields=['actual_outcome', 'note', 'updated_at'])
+
+        # Cascade updates based on admin feedback to transactions/loans
+        if record.source == 'transaction' and record.transaction:
+            txn = record.transaction
+            user = txn.user
+            
+            if actual_outcome == FraudActualOutcome.FRAUD:
+                txn.status = TransactionStatus.FLAGGED
+                txn.save(update_fields=['status'])
+                
+                # Update assessments & trust metrics to risk = High
+                TransactionTrust.objects.update_or_create(
+                    transaction=txn,
+                    defaults={
+                        'fraud_flag': True,
+                        'risk_level': RiskLevelType.HIGH,
+                    }
+                )
+                FraudAssessment.objects.update_or_create(
+                    transaction=txn,
+                    defaults={
+                        'prediction': 1,
+                        'risk_level': RiskLevelType.HIGH,
+                    }
+                )
+                
+            elif actual_outcome == FraudActualOutcome.LEGITIMATE:
+                txn.status = TransactionStatus.COMPLETED
+                txn.save(update_fields=['status'])
+                
+                TransactionTrust.objects.update_or_create(
+                    transaction=txn,
+                    defaults={
+                        'fraud_flag': False,
+                        'risk_level': RiskLevelType.LOW,
+                    }
+                )
+                FraudAssessment.objects.update_or_create(
+                    transaction=txn,
+                    defaults={
+                        'prediction': 0,
+                        'risk_level': RiskLevelType.LOW,
+                    }
+                )
+                
+            # Trigger trust profile recalculation
+            TrustProfileService.update_user_profile(user, event_type='feedback_received')
+            
+            # Send notifications
+            NotificationEngine.notify_user(
+                user,
+                NotificationCategory.FRAUD_ALERT,
+                'Transaction status updated',
+                f'Your transaction of {txn.amount} has been updated to {txn.status} based on feedback review.',
+                related_transaction=txn,
+            )
+            NotificationEngine.notify_admin(
+                NotificationCategory.FRAUD_ALERT,
+                'Feedback propagation completed',
+                f'Transaction {txn.id} for user {user.username} has been marked as {txn.status}.',
+                related_transaction=txn,
+            )
+
+        elif record.source == 'loan' and record.loan_request:
+            loan = record.loan_request
+            user = loan.user
+            
+            if actual_outcome == FraudActualOutcome.FRAUD:
+                loan.status = LoanRequestStatus.REJECTED
+                loan.ai_recommendation = LoanAIRecommendation.REJECT
+                loan.ai_risk_level = RiskLevelType.HIGH
+                loan.save(update_fields=['status', 'ai_recommendation', 'ai_risk_level', 'updated_at'])
+                
+            elif actual_outcome == FraudActualOutcome.LEGITIMATE:
+                loan.status = LoanRequestStatus.APPROVED
+                loan.ai_recommendation = LoanAIRecommendation.APPROVE
+                loan.ai_risk_level = RiskLevelType.LOW
+                loan.save(update_fields=['status', 'ai_recommendation', 'ai_risk_level', 'updated_at'])
+                
+            # Trigger trust profile recalculation
+            TrustProfileService.update_user_profile(user, event_type='loan_feedback_received')
+
         return record
 
 
PATCH_EOF

echo "Patch applied successfully."
