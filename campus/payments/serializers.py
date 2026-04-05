from decimal import Decimal, InvalidOperation

from django.db.models import Avg
from rest_framework import serializers

from .models import (
    DataSourceType,
    FraudActualOutcome,
    FraudFeedbackRecord,
    LoanRequest,
    Merchant,
    OTPPurpose,
    RiskAlert,
    SystemNotification,
    Transaction,
    TransactionStatus,
    User,
    UserTrustProfile,
    ValidationLog,
)


class NumericIPAddressField(serializers.Field):
    def to_internal_value(self, data):
        if data in (None, ""):
            raise serializers.ValidationError("ip_address is required.")

        if isinstance(data, int):
            return data

        if isinstance(data, float):
            return int(data)

        text = str(data).strip()
        try:
            from ipaddress import ip_address

            return int(ip_address(text))
        except ValueError:
            try:
                return int(float(text))
            except ValueError as exc:
                raise serializers.ValidationError("ip_address must be numeric or a valid IPv4/IPv6 string.") from exc

    def to_representation(self, value):
        if value is None:
            return None
        return int(value)


class OTPRequestSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=32)
    purpose = serializers.ChoiceField(choices=OTPPurpose.choices, default=OTPPurpose.USER)


class OTPVerifySerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=32)
    otp_code = serializers.RegexField(regex=r'^\d{6}$', max_length=6)
    purpose = serializers.ChoiceField(choices=OTPPurpose.choices, default=OTPPurpose.USER)
    name = serializers.CharField(max_length=120, required=False, allow_blank=True)
    age = serializers.IntegerField(required=False)


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'student_id', 'full_name', 'sex', 'age', 'signup_time', 'is_active']

    def get_full_name(self, obj):
        return obj.get_full_name() or f"{obj.first_name} {obj.last_name}".strip()


class MerchantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = ['id', 'name', 'category', 'source_identifier']


class ValidationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValidationLog
        fields = ['id', 'check_type', 'check_passed', 'message', 'checked_at']


class TransactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    merchant = MerchantSerializer(read_only=True)
    validation_logs = ValidationLogSerializer(many=True, read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'merchant', 'amount', 'status',
            'device_id', 'ip_address', 'user_agent', 'transaction_source',
            'purchase_time', 'created_at', 'data_source', 'source_confidence',
            'parsing_success', 'validation_score', 'extracted_at', 'validation_logs'
        ]


class TransactionUploadSerializer(serializers.Serializer):
    """Special serializer for handling image/SMS/PDF uploads"""
    file = serializers.FileField(required=False)
    raw_text = serializers.CharField(required=False)
    source_type = serializers.ChoiceField(choices=['sms', 'screenshot', 'pdf', 'manual'])
    device_id = serializers.CharField(max_length=255)
    ip_address = serializers.IPAddressField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    purchase_time = serializers.DateTimeField(required=False)
    age = serializers.IntegerField(required=False)
    user_id = serializers.IntegerField(required=False)
    external_user_key = serializers.CharField(required=False, allow_blank=True)
    owner_name = serializers.CharField(required=False, allow_blank=True)
    continue_on_gaps = serializers.BooleanField(required=False)


class PredictionRequestSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    signup_time = serializers.DateTimeField()
    purchase_time = serializers.DateTimeField()
    purchase_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    age = serializers.IntegerField()
    ip_address = NumericIPAddressField()
    user_transaction_count = serializers.IntegerField(required=False, default=1, min_value=1)
    device_transaction_count = serializers.IntegerField(required=False, default=1, min_value=1)
    source_type = serializers.ChoiceField(choices=list(DataSourceType.choices), required=False, default=DataSourceType.MANUAL)
    device_id = serializers.CharField(required=False, allow_blank=True)
    parsing_success = serializers.FloatField(required=False, default=1.0, min_value=0.0, max_value=1.0)
    source_confidence = serializers.FloatField(required=False, default=0.9, min_value=0.0, max_value=1.0)


class LoanRequestCreateSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(required=False, write_only=True)
    external_user_key = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = LoanRequest
        fields = [
            'id',
            'requested_amount',
            'requested_tenure_months',
            'stated_income',
            'purpose',
            'user_id',
            'external_user_key',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']


class LoanRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    decision_stats = serializers.SerializerMethodField()
    decision_summary = serializers.SerializerMethodField()

    @staticmethod
    def _safe_decimal(value, default=Decimal('0')):
        try:
            return Decimal(str(value))
        except (InvalidOperation, TypeError, ValueError):
            return default

    @staticmethod
    def _to_float(value, digits=4):
        return round(float(value), digits)

    def _build_decision_stats(self, obj):
        requested_amount = self._safe_decimal(obj.requested_amount)
        stated_income = self._safe_decimal(obj.stated_income, Decimal('0'))
        effective_income = stated_income if stated_income > 0 else Decimal('1')

        debt_ratio = requested_amount / effective_income
        debt_ratio_threshold = Decimal('0.60')
        affordability_penalty = Decimal('0.10') if debt_ratio > debt_ratio_threshold else Decimal('0.00')

        reject_threshold = Decimal('0.50')
        final_score = None
        base_model_score = None
        score_margin = None
        if obj.ai_score is not None:
            final_score = self._safe_decimal(obj.ai_score, Decimal('0.00'))
            base_model_score = max(Decimal('0.00'), final_score - affordability_penalty)
            score_margin = final_score - reject_threshold

        user_transactions = Transaction.objects.filter(user=obj.user)
        transaction_count = user_transactions.count()
        flagged_count = user_transactions.filter(status=TransactionStatus.FLAGGED).count()
        average_transaction = self._safe_decimal(
            user_transactions.aggregate(avg_amount=Avg('amount')).get('avg_amount'),
            Decimal('0'),
        )

        flagged_rate_percent = (
            (Decimal(flagged_count) / Decimal(transaction_count)) * Decimal('100')
            if transaction_count
            else Decimal('0')
        )
        amount_vs_average_ratio = (
            (requested_amount / average_transaction)
            if average_transaction > 0
            else None
        )

        factors = [
            {
                'key': 'overall_risk_score',
                'label': 'Overall risk score',
                'value': self._to_float(final_score) if final_score is not None else None,
                'threshold': self._to_float(reject_threshold),
                'formatted_value': f"{self._to_float(final_score * 100, 1)}%" if final_score is not None else 'Pending evaluation',
                'formatted_threshold': f"{self._to_float(reject_threshold * 100, 1)}%",
                'triggered': bool(final_score is not None and final_score >= reject_threshold),
                'severity': 'high' if final_score is not None and final_score >= reject_threshold else 'low',
                'impact': 'Score crossed the rejection threshold.',
            },
            {
                'key': 'debt_ratio',
                'label': 'Loan-to-income ratio',
                'value': self._to_float(debt_ratio),
                'threshold': self._to_float(debt_ratio_threshold),
                'formatted_value': f"{self._to_float(debt_ratio * 100, 1)}%",
                'formatted_threshold': f"{self._to_float(debt_ratio_threshold * 100, 1)}%",
                'triggered': debt_ratio > debt_ratio_threshold,
                'severity': 'high' if debt_ratio > debt_ratio_threshold else 'low',
                'impact': 'Requested amount is high compared with stated income.',
            },
            {
                'key': 'flagged_history_rate',
                'label': 'Flagged transaction rate',
                'value': self._to_float(flagged_rate_percent),
                'threshold': 20.0,
                'formatted_value': f"{self._to_float(flagged_rate_percent, 1)}%",
                'formatted_threshold': '20.0%',
                'triggered': bool(transaction_count and flagged_rate_percent >= Decimal('20')),
                'severity': 'medium' if transaction_count and flagged_rate_percent >= Decimal('20') else 'low',
                'impact': 'Past transaction behavior has frequent flagged events.',
            },
            {
                'key': 'amount_spike_vs_history',
                'label': 'Amount spike vs user average',
                'value': self._to_float(amount_vs_average_ratio) if amount_vs_average_ratio is not None else None,
                'threshold': 2.0,
                'formatted_value': f"{self._to_float(amount_vs_average_ratio, 2)}x" if amount_vs_average_ratio is not None else 'No history',
                'formatted_threshold': '2.00x',
                'triggered': bool(amount_vs_average_ratio is not None and amount_vs_average_ratio >= Decimal('2.0')),
                'severity': 'medium' if amount_vs_average_ratio is not None and amount_vs_average_ratio >= Decimal('2.0') else 'low',
                'impact': 'Requested amount is much larger than this user\'s normal transactions.',
            },
        ]

        triggered_factors = [factor for factor in factors if factor['triggered']]
        if obj.ai_score is None:
            summary = 'Awaiting AI evaluation. Run evaluate to generate a full decision profile.'
        elif triggered_factors:
            summary = 'Recommended rejection because: ' + '; '.join(
                f"{factor['label']} ({factor['formatted_value']} vs {factor['formatted_threshold']})"
                for factor in triggered_factors
            )
        else:
            summary = 'No major rejection triggers detected from score, affordability, or transaction history.'

        return {
            'recommended_action': obj.ai_recommendation or 'pending',
            'risk_level': obj.ai_risk_level or 'Unknown',
            'summary': summary,
            'metrics': {
                'risk_score': self._to_float(final_score) if final_score is not None else None,
                'risk_score_percent': self._to_float(final_score * 100, 1) if final_score is not None else None,
                'base_model_score': self._to_float(base_model_score) if base_model_score is not None else None,
                'reject_threshold': self._to_float(reject_threshold),
                'reject_threshold_percent': self._to_float(reject_threshold * 100, 1),
                'score_margin': self._to_float(score_margin) if score_margin is not None else None,
                'score_margin_percent': self._to_float(score_margin * 100, 1) if score_margin is not None else None,
                'debt_ratio': self._to_float(debt_ratio),
                'debt_ratio_percent': self._to_float(debt_ratio * 100, 1),
                'debt_ratio_threshold': self._to_float(debt_ratio_threshold),
                'debt_ratio_threshold_percent': self._to_float(debt_ratio_threshold * 100, 1),
                'affordability_penalty': self._to_float(affordability_penalty),
                'affordability_penalty_percent': self._to_float(affordability_penalty * 100, 1),
                'transaction_count': transaction_count,
                'flagged_transaction_count': flagged_count,
                'flagged_rate_percent': self._to_float(flagged_rate_percent, 1),
                'average_transaction_amount': self._to_float(average_transaction, 2),
                'amount_vs_average_ratio': self._to_float(amount_vs_average_ratio, 2) if amount_vs_average_ratio is not None else None,
            },
            'factors': factors,
            'primary_reasons': [factor['impact'] for factor in triggered_factors],
        }

    def get_decision_stats(self, obj):
        cached = getattr(obj, '_decision_stats_cache', None)
        if cached is None:
            cached = self._build_decision_stats(obj)
            setattr(obj, '_decision_stats_cache', cached)
        return cached

    def get_decision_summary(self, obj):
        return self.get_decision_stats(obj).get('summary')

    class Meta:
        model = LoanRequest
        fields = [
            'id',
            'user',
            'requested_amount',
            'requested_tenure_months',
            'stated_income',
            'purpose',
            'status',
            'ai_recommendation',
            'ai_risk_level',
            'ai_score',
            'decision_summary',
            'decision_stats',
            'decision_reasoning',
            'admin_decision_note',
            'decided_by',
            'decided_at',
            'evaluated_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class LoanStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanRequest
        fields = ['id', 'status', 'ai_recommendation', 'ai_risk_level', 'ai_score', 'evaluated_at', 'decided_at']


class LoanDecisionSerializer(serializers.Serializer):
    note = serializers.CharField(required=False, allow_blank=True)


class UserTrustProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserTrustProfile
        fields = [
            'id',
            'user',
            'trust_score',
            'risk_level',
            'total_transactions',
            'flagged_transactions',
            'high_risk_transactions',
            'flagged_ratio',
            'behavior_change_count',
            'last_event_type',
            'updated_at',
        ]


class FraudFeedbackRecordSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = FraudFeedbackRecord
        fields = [
            'id',
            'user',
            'transaction',
            'loan_request',
            'source',
            'predicted_label',
            'predicted_probability',
            'predicted_risk_level',
            'actual_outcome',
            'note',
            'created_at',
            'updated_at',
        ]


class FraudFeedbackOutcomeUpdateSerializer(serializers.Serializer):
    actual_outcome = serializers.ChoiceField(choices=FraudActualOutcome.choices)
    note = serializers.CharField(required=False, allow_blank=True)


class SystemNotificationSerializer(serializers.ModelSerializer):
    recipient_user = UserSerializer(read_only=True)

    class Meta:
        model = SystemNotification
        fields = [
            'id',
            'recipient_scope',
            'recipient_user',
            'category',
            'title',
            'message',
            'related_transaction',
            'related_loan_request',
            'metadata',
            'delivery_status',
            'sent_at',
            'read_at',
            'created_at',
        ]


class RiskAlertSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = RiskAlert
        fields = [
            'id',
            'user',
            'transaction',
            'alert_type',
            'pattern_key',
            'severity',
            'details',
            'status',
            'detected_at',
            'resolved_at',
            'updated_at',
        ]
