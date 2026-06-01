from decimal import Decimal
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

from payments.models import (
    Transaction,
    TransactionStatus,
    TransactionTrust,
    FraudAssessment,
    FraudFeedbackRecord,
    UserTrustProfile,
    FraudActualOutcome,
    RiskLevelType,
    SystemNotification,
    NotificationRecipientScope,
)
from payments.services import FraudFeedbackService, TrustProfileService

User = get_user_model()

class FeedbackPropagationTests(APITestCase):
    def setUp(self):
        # Create user
        self.user = User.objects.create(
            username="portal_testuser",
            student_id="PTL-TESTUSER",
            sex="Other",
            age=25,
            phone_number="+251911999999",
            is_active=True,
        )
        
        # Create transaction
        self.transaction = Transaction.objects.create(
            user=self.user,
            amount=Decimal("1500.00"),
            status=TransactionStatus.PENDING,
            device_id="test-device-id",
            ip_address="127.0.0.1",
            data_source="manual",
        )
        
        # Create assessment and trust metrics
        self.assessment = FraudAssessment.objects.create(
            transaction=self.transaction,
            prediction=0,
            fraud_probability=Decimal("0.1500"),
            risk_level=RiskLevelType.LOW,
        )
        self.trust = TransactionTrust.objects.create(
            transaction=self.transaction,
            fraud_flag=False,
            confidence_score=Decimal("0.9000"),
            risk_level=RiskLevelType.LOW,
        )
        
        # Initial trust profile
        TrustProfileService.update_user_profile(self.user)
        
        # Create feedback record
        self.feedback_record = FraudFeedbackRecord.objects.create(
            user=self.user,
            transaction=self.transaction,
            source="transaction",
            predicted_label=False,
            predicted_probability=Decimal("0.1500"),
            predicted_risk_level=RiskLevelType.LOW,
            actual_outcome=FraudActualOutcome.UNCONFIRMED,
        )
        
        # We need an admin user for permission check if needed, but the endpoint AllowAny/is_admin_phone is handled
        # We will use the direct service or the endpoint with admin parameters.
        
    def test_feedback_propagation_to_fraud(self):
        """
        Verify that confirming actual_outcome=fraud propagates status, trust,
        and assessments correctly to FLAGGED/HIGH risk, and updates user trust profile.
        """
        # Call actual-outcome endpoint with admin parameters
        payload = {
            "actual_outcome": "fraud",
            "note": "Confirmed fraud transaction",
            "admin_view": "true",
            "admin_phone": "+251911000001",
        }
        
        url = f"/api/fraud/feedback/{self.feedback_record.id}/actual-outcome/"
        response = self.client.post(url, data=payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 1. Check feedback record
        self.feedback_record.refresh_from_db()
        self.assertEqual(self.feedback_record.actual_outcome, FraudActualOutcome.FRAUD)
        self.assertEqual(self.feedback_record.note, "Confirmed fraud transaction")
        
        # 2. Check transaction status propagated to flagged
        self.transaction.refresh_from_db()
        self.assertEqual(self.transaction.status, TransactionStatus.FLAGGED)
        
        # 3. Check trust metrics propagated to High/True
        self.trust.refresh_from_db()
        self.assertTrue(self.trust.fraud_flag)
        self.assertEqual(self.trust.risk_level, RiskLevelType.HIGH)
        
        # 4. Check fraud assessment updated
        self.assessment.refresh_from_db()
        self.assertEqual(self.assessment.prediction, 1)
        self.assertEqual(self.assessment.risk_level, RiskLevelType.HIGH)
        
        # 5. Check user trust profile is updated (score drops significantly due to flagged ratio)
        profile = UserTrustProfile.objects.get(user=self.user)
        self.assertLess(profile.trust_score, Decimal("100.00"))
        self.assertEqual(profile.flagged_transactions, 1)
        
        # 6. Check notifications created
        user_notifications = SystemNotification.objects.filter(
            recipient_user=self.user,
            recipient_scope=NotificationRecipientScope.USER,
        )
        self.assertTrue(user_notifications.exists())
        
        admin_notifications = SystemNotification.objects.filter(
            recipient_scope=NotificationRecipientScope.ADMIN,
        )
        self.assertTrue(admin_notifications.exists())

    def test_feedback_propagation_to_legitimate(self):
        """
        Verify that confirming actual_outcome=legitimate resets/maintains completed/low risk.
        """
        # Set transaction status to flagged initially to simulate correction
        self.transaction.status = TransactionStatus.FLAGGED
        self.transaction.save()
        
        self.trust.fraud_flag = True
        self.trust.risk_level = RiskLevelType.HIGH
        self.trust.save()
        
        self.assessment.prediction = 1
        self.assessment.risk_level = RiskLevelType.HIGH
        self.assessment.save()
        
        # Call actual-outcome endpoint with admin parameters
        payload = {
            "actual_outcome": "legitimate",
            "note": "False positive, legitimate user",
            "admin_view": "true",
            "admin_phone": "+251911000001",
        }
        
        url = f"/api/fraud/feedback/{self.feedback_record.id}/actual-outcome/"
        response = self.client.post(url, data=payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check feedback record
        self.feedback_record.refresh_from_db()
        self.assertEqual(self.feedback_record.actual_outcome, FraudActualOutcome.LEGITIMATE)
        
        # Check transaction status reset to completed
        self.transaction.refresh_from_db()
        self.assertEqual(self.transaction.status, TransactionStatus.COMPLETED)
        
        # Check trust metrics updated to Low/False
        self.trust.refresh_from_db()
        self.assertFalse(self.trust.fraud_flag)
        self.assertEqual(self.trust.risk_level, RiskLevelType.LOW)
        
        # Check fraud assessment prediction reset
        self.assessment.refresh_from_db()
        self.assertEqual(self.assessment.prediction, 0)
        self.assertEqual(self.assessment.risk_level, RiskLevelType.LOW)
        
        # Check user trust profile is updated (score goes back up)
        profile = UserTrustProfile.objects.get(user=self.user)
        self.assertEqual(profile.flagged_transactions, 0)
