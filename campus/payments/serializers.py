from rest_framework import serializers
from .models import DataSourceType, LoanRequest, Merchant, Transaction, User, ValidationLog


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
    class Meta:
        model = LoanRequest
        fields = [
            'id',
            'requested_amount',
            'requested_tenure_months',
            'stated_income',
            'purpose',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']


class LoanRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

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
