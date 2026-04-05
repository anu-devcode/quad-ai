from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import (
	ConfidenceScore,
	FraudAssessment,
	LoanRequest,
	Merchant,
	ModelInputFeature,
	Transaction,
	TransactionTrust,
	User,
	ValidationLog,
	OTPVerificationCode
)




@admin.register(OTPVerificationCode)
class OTPVerificationCodeAdmin(admin.ModelAdmin):
	list_display = ("id", "phone_number", "purpose", "is_used", "created_at", "expires_at")
@admin.register(User)
class UserAdmin(DjangoUserAdmin):
	list_display = ("username", "email", "student_id", "sex", "age", "is_active", "is_staff")
	search_fields = ("username", "email", "student_id", "first_name", "last_name")


@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
	list_display = ("id", "name", "category", "source_identifier")
	search_fields = ("name", "source_identifier")


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
	list_display = ("id", "user", "amount", "status", "data_source", "source_confidence", "purchase_time")
	list_filter = ("status", "data_source", "source_confidence", "parsing_success")
	search_fields = ("user__username", "user__student_id", "device_id", "ip_address")


@admin.register(ValidationLog)
class ValidationLogAdmin(admin.ModelAdmin):
	list_display = ("id", "transaction", "check_type", "check_passed", "checked_at")
	list_filter = ("check_type", "check_passed")
	search_fields = ("transaction__id", "message")


@admin.register(ConfidenceScore)
class ConfidenceScoreAdmin(admin.ModelAdmin):
	list_display = ("transaction", "confidence_level", "trust_level", "computed_at")
	list_filter = ("trust_level",)


@admin.register(FraudAssessment)
class FraudAssessmentAdmin(admin.ModelAdmin):
	list_display = ("transaction", "prediction", "fraud_probability", "risk_level", "assessed_at")
	list_filter = ("prediction", "risk_level")


@admin.register(TransactionTrust)
class TransactionTrustAdmin(admin.ModelAdmin):
	list_display = ("transaction", "fraud_flag", "confidence_score", "risk_level", "computed_at")
	list_filter = ("fraud_flag", "risk_level")


@admin.register(ModelInputFeature)
class ModelInputFeatureAdmin(admin.ModelAdmin):
	list_display = (
		"transaction",
		"user",
		"purchase_value",
		"age",
		"data_source",
		"source_confidence",
		"validation_score",
	)
	readonly_fields = [field.name for field in ModelInputFeature._meta.fields]

	def has_add_permission(self, request):
		return False

	def has_change_permission(self, request, obj=None):
		return False

	def has_delete_permission(self, request, obj=None):
		return False


@admin.register(LoanRequest)
class LoanRequestAdmin(admin.ModelAdmin):
	list_display = (
		"id",
		"user",
		"requested_amount",
		"requested_tenure_months",
		"status",
		"ai_recommendation",
		"ai_risk_level",
		"created_at",
		"decided_at",
	)
	list_filter = ("status", "ai_recommendation", "ai_risk_level", "created_at")
	search_fields = ("user__username", "user__student_id", "purpose", "decision_reasoning")
