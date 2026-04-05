from django.db import models
from django.contrib.auth.models import AbstractUser

class GenderType(models.TextChoices):
    MALE = 'M', 'M'
    FEMALE = 'F', 'F'
    OTHER = 'Other', 'Other'

class TransactionStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    FLAGGED = 'flagged', 'Flagged'
    REVERSED = 'reversed', 'Reversed'

class RiskLevelType(models.TextChoices):
    LOW = 'Low', 'Low'
    MEDIUM = 'Medium', 'Medium'
    HIGH = 'High', 'High'

class DataSourceType(models.TextChoices):
    SMS = 'sms', 'SMS'
    SCREENSHOT = 'screenshot', 'Screenshot'
    PDF = 'pdf', 'PDF'
    MANUAL = 'manual', 'Manual'

class SourceConfidence(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    HIGH = 'high', 'High'


class LoanRequestStatus(models.TextChoices):
    SUBMITTED = 'submitted', 'Submitted'
    EVALUATING = 'evaluating', 'Evaluating'
    EVALUATED = 'evaluated', 'Evaluated'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'


class LoanAIRecommendation(models.TextChoices):
    APPROVE = 'approve', 'Approve'
    REJECT = 'reject', 'Reject'


class FraudActualOutcome(models.TextChoices):
    FRAUD = 'fraud', 'Fraud'
    LEGITIMATE = 'legitimate', 'Legitimate'
    UNCONFIRMED = 'unconfirmed', 'Unconfirmed'


class NotificationRecipientScope(models.TextChoices):
    USER = 'user', 'User'
    ADMIN = 'admin', 'Admin'


class NotificationCategory(models.TextChoices):
    LOAN_UPDATE = 'loan_update', 'Loan Update'
    FRAUD_ALERT = 'fraud_alert', 'Fraud Alert'
    ADMIN_DECISION = 'admin_decision', 'Admin Decision'


class NotificationDeliveryStatus(models.TextChoices):
    QUEUED = 'queued', 'Queued'
    SENT = 'sent', 'Sent'
    READ = 'read', 'Read'


class RiskAlertSeverity(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    HIGH = 'high', 'High'
    CRITICAL = 'critical', 'Critical'


class RiskAlertStatus(models.TextChoices):
    OPEN = 'open', 'Open'
    RESOLVED = 'resolved', 'Resolved'
    DISMISSED = 'dismissed', 'Dismissed'


class OTPPurpose(models.TextChoices):
    USER = 'user', 'User'
    ADMIN = 'admin', 'Admin'

class User(AbstractUser):
    student_id = models.CharField(max_length=20, unique=True)
    sex = models.CharField(max_length=10, choices=GenderType.choices)
    age = models.IntegerField(null=True, blank=True)
    phone_number = models.CharField(max_length=32, unique=True, null=True, blank=True, db_index=True)
    city_region = models.CharField(max_length=120, blank=True, default='')
    financial_institutions = models.JSONField(default=list, blank=True)
    signup_time = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.full_name} ({self.student_id})"
    
    

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class OTPVerificationCode(models.Model):
    phone_number = models.CharField(max_length=32, db_index=True)
    otp_code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=10, choices=OTPPurpose.choices, default=OTPPurpose.USER, db_index=True)
    is_used = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['phone_number', 'purpose', 'is_used', 'expires_at']),
        ]

    def __str__(self):
        return f"OTP {self.phone_number} ({self.purpose})"

class Merchant(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, null=True, blank=True)
    source_identifier = models.CharField(max_length=50, unique=True, null=True, blank=True)

    def __str__(self):
        return self.name

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    merchant = models.ForeignKey(Merchant, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=20, choices=TransactionStatus.choices, default=TransactionStatus.PENDING)
    
    device_id = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(null=True, blank=True)
    transaction_source = models.CharField(max_length=50, null=True, blank=True)
    purchase_time = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # OCR/Ingestion Metadata
    data_source = models.CharField(max_length=20, choices=DataSourceType.choices, default=DataSourceType.MANUAL)
    source_confidence = models.CharField(max_length=20, choices=SourceConfidence.choices, null=True, blank=True)
    parsing_success = models.BooleanField(default=True)
    validation_score = models.DecimalField(max_digits=5, decimal_places=4, default=1.0)
    extracted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"TXN {self.id} - {self.user.student_id} - ${self.amount}"

class ValidationLog(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='validation_logs')
    check_type = models.CharField(max_length=50) # e.g., 'timestamp', 'amount', 'repetition'
    check_passed = models.BooleanField()
    message = models.TextField(null=True, blank=True)
    checked_at = models.DateTimeField(auto_now_add=True)

class ConfidenceScore(models.Model):
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='confidence_score')
    confidence_level = models.DecimalField(max_digits=5, decimal_places=4) # 0.0 to 1.0
    trust_level = models.CharField(max_length=20, choices=RiskLevelType.choices)
    computed_at = models.DateTimeField(auto_now_add=True)

class FraudAssessment(models.Model):
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='fraud_assessment')
    prediction = models.IntegerField() # 0 or 1
    fraud_probability = models.DecimalField(max_digits=5, decimal_places=4)
    risk_level = models.CharField(max_length=20, choices=RiskLevelType.choices)
    assessed_at = models.DateTimeField(auto_now_add=True)

class TransactionTrust(models.Model):
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='trust_metrics')
    fraud_flag = models.BooleanField(default=False)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=4)
    risk_level = models.CharField(max_length=20, choices=RiskLevelType.choices)
    computed_at = models.DateTimeField(auto_now_add=True)

class ModelInputFeature(models.Model):
    """Unmanaged model representing the SQL view for ML features"""
    transaction = models.OneToOneField(Transaction, on_delete=models.DO_NOTHING, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    purchase_value = models.DecimalField(max_digits=15, decimal_places=2)
    age = models.IntegerField()
    ip_address = models.GenericIPAddressField()
    data_source = models.CharField(max_length=20)
    source_confidence = models.CharField(max_length=20)
    validation_score = models.DecimalField(max_digits=5, decimal_places=4)
    time_since_signup = models.FloatField()
    purchase_hour = models.IntegerField()
    purchase_day_of_week = models.IntegerField()
    purchase_month = models.IntegerField()
    purchase_day_of_month = models.IntegerField()
    is_weekend = models.BooleanField()
    user_transaction_count = models.IntegerField()
    user_avg_purchase = models.DecimalField(max_digits=15, decimal_places=2)
    purchase_deviation = models.DecimalField(max_digits=15, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'v_model_input_features'


class LoanRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loan_requests')
    requested_amount = models.DecimalField(max_digits=15, decimal_places=2)
    requested_tenure_months = models.PositiveIntegerField()
    stated_income = models.DecimalField(max_digits=15, decimal_places=2)
    purpose = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=LoanRequestStatus.choices,
        default=LoanRequestStatus.SUBMITTED,
    )

    ai_recommendation = models.CharField(
        max_length=20,
        choices=LoanAIRecommendation.choices,
        null=True,
        blank=True,
    )
    ai_risk_level = models.CharField(max_length=20, choices=RiskLevelType.choices, null=True, blank=True)
    ai_score = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)
    decision_reasoning = models.TextField(null=True, blank=True)

    admin_decision_note = models.TextField(null=True, blank=True)
    decided_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='loan_decisions',
    )
    decided_at = models.DateTimeField(null=True, blank=True)
    evaluated_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"LoanRequest {self.id} - {self.user.student_id} - {self.status}"


class UserTrustProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='trust_profile')
    trust_score = models.DecimalField(max_digits=5, decimal_places=2, default=50.00)
    risk_level = models.CharField(max_length=20, choices=RiskLevelType.choices, default=RiskLevelType.MEDIUM)
    total_transactions = models.PositiveIntegerField(default=0)
    flagged_transactions = models.PositiveIntegerField(default=0)
    high_risk_transactions = models.PositiveIntegerField(default=0)
    flagged_ratio = models.DecimalField(max_digits=5, decimal_places=4, default=0.0)
    behavior_change_count = models.PositiveIntegerField(default=0)
    last_event_type = models.CharField(max_length=60, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"TrustProfile {self.user.student_id} - {self.trust_score}"


class FraudFeedbackRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fraud_feedback_records')
    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.CASCADE,
        related_name='fraud_feedback_record',
        null=True,
        blank=True,
    )
    loan_request = models.OneToOneField(
        LoanRequest,
        on_delete=models.CASCADE,
        related_name='fraud_feedback_record',
        null=True,
        blank=True,
    )
    source = models.CharField(max_length=30, default='transaction')
    predicted_label = models.BooleanField(default=False)
    predicted_probability = models.DecimalField(max_digits=5, decimal_places=4)
    predicted_risk_level = models.CharField(max_length=20, choices=RiskLevelType.choices, null=True, blank=True)
    actual_outcome = models.CharField(max_length=20, choices=FraudActualOutcome.choices, default=FraudActualOutcome.UNCONFIRMED)
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Feedback {self.id} - {self.source}"


class SystemNotification(models.Model):
    recipient_scope = models.CharField(max_length=20, choices=NotificationRecipientScope.choices, default=NotificationRecipientScope.USER)
    recipient_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='system_notifications')
    category = models.CharField(max_length=30, choices=NotificationCategory.choices)
    title = models.CharField(max_length=160)
    message = models.TextField()
    related_transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True, blank=True, related_name='system_notifications')
    related_loan_request = models.ForeignKey(LoanRequest, on_delete=models.SET_NULL, null=True, blank=True, related_name='system_notifications')
    metadata = models.JSONField(default=dict, blank=True)
    delivery_status = models.CharField(max_length=20, choices=NotificationDeliveryStatus.choices, default=NotificationDeliveryStatus.SENT)
    sent_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification {self.id} - {self.category}"


class RiskAlert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='risk_alerts')
    transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True, blank=True, related_name='risk_alerts')
    alert_type = models.CharField(max_length=80)
    pattern_key = models.CharField(max_length=80)
    severity = models.CharField(max_length=20, choices=RiskAlertSeverity.choices, default=RiskAlertSeverity.MEDIUM)
    details = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=RiskAlertStatus.choices, default=RiskAlertStatus.OPEN)
    detected_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"RiskAlert {self.id} - {self.pattern_key}"
