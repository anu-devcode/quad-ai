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

class User(AbstractUser):
    student_id = models.CharField(max_length=20, unique=True)
    sex = models.CharField(max_length=10, choices=GenderType.choices)
    age = models.IntegerField(null=True, blank=True)
    signup_time = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.full_name} ({self.student_id})"
    
    

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

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
