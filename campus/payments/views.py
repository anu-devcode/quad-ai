import os
import re
import secrets
import uuid
from datetime import timedelta

from decimal import Decimal
from ipaddress import ip_address

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from django.db.models import Avg, Count, Max, Q, Sum
from django.utils import timezone

from .models import (
    ConfidenceScore,
    FraudAssessment,
    FraudFeedbackRecord,
    LoanAIRecommendation,
    LoanRequest,
    LoanRequestStatus,
    NotificationDeliveryStatus,
    NotificationRecipientScope,
    OTPPurpose,
    OTPVerificationCode,
    RiskAlert,
    RiskAlertStatus,
    RiskLevelType,
    SystemNotification,
    Transaction,
    TransactionStatus,
    TransactionTrust,
    User,
    UserTrustProfile,
    ValidationLog,
)
from .project_verifier import ProjectVerificationService
from .serializers import (
    FraudFeedbackOutcomeUpdateSerializer,
    FraudFeedbackRecordSerializer,
    LoanDecisionSerializer,
    LoanRequestCreateSerializer,
    LoanRequestSerializer,
    LoanStatusSerializer,
    OTPRequestSerializer,
    OTPVerifySerializer,
    PredictionRequestSerializer,
    RiskAlertSerializer,
    SystemNotificationSerializer,
    TransactionSerializer,
    TransactionUploadSerializer,
    UserSerializer,
    UserTrustProfileSerializer,
)
from .services import BackgroundAutomationService, FraudFeedbackService, FraudScoringService, SOURCE_CONFIDENCE_BY_TYPE


class PortalUserResolutionMixin:
    ADMIN_PHONE_WHITELIST = {
        '+251911000001',
        '+251911000002',
        '+251900000000',
    }

    @staticmethod
    def _as_bool(value, default=False):
        if value is None:
            return default
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return value != 0
        return str(value).strip().lower() in {'1', 'true', 'yes', 'y', 'on'}

    @classmethod
    def _is_admin_phone(cls, phone):
        normalized = re.sub(r'[\s\-().]', '', str(phone or ''))
        if not normalized:
            return False
        return any(re.sub(r'[\s\-().]', '', item) == normalized for item in cls.ADMIN_PHONE_WHITELIST)

    def _is_admin_view_request(self, request):
        admin_view_flag = self._as_bool(
            request.query_params.get('admin_view')
            or request.data.get('admin_view'),
            default=False,
        )
        if not admin_view_flag:
            return False

        admin_phone = request.query_params.get('admin_phone') or request.data.get('admin_phone')
        return self._is_admin_phone(admin_phone)

    @staticmethod
    def _normalize_external_user_key(value):
        if value in (None, ''):
            return ''
        return re.sub(r'[^a-zA-Z0-9]', '', str(value)).lower()[:48]

    @staticmethod
    def _build_portal_username(normalized_key):
        return f'portal_{normalized_key}'[:150]

    @staticmethod
    def _build_student_id(normalized_key):
        base = f'PTL-{normalized_key}'[:20]
        return base or 'PTL-USER'

    @staticmethod
    def _split_name(display_name):
        parts = [part for part in str(display_name or '').strip().split() if part]
        if not parts:
            return '', ''
        if len(parts) == 1:
            return parts[0], ''
        return parts[0], ' '.join(parts[1:])

    @staticmethod
    def _parse_age(value):
        try:
            parsed = int(value)
        except (TypeError, ValueError):
            return None
        return parsed if parsed > 0 else None

    def _find_portal_user(self, external_user_key):
        normalized = self._normalize_external_user_key(external_user_key)
        if not normalized:
            return None
        username = self._build_portal_username(normalized)
        return User.objects.filter(username=username).first()

    def _get_or_create_portal_user(self, external_user_key, display_name='', age=None):
        normalized = self._normalize_external_user_key(external_user_key)
        if not normalized:
            return None

        existing_user = self._find_portal_user(normalized)
        if existing_user is not None:
            return existing_user

        first_name, last_name = self._split_name(display_name)
        candidate_student_id = self._build_student_id(normalized)
        counter = 1
        while User.objects.filter(student_id=candidate_student_id).exists():
            suffix = f'{counter:02d}'
            base = self._build_student_id(normalized)
            candidate_student_id = f"{base[:max(1, 20 - len(suffix))]}{suffix}"
            counter += 1

        user = User.objects.create(
            username=self._build_portal_username(normalized),
            student_id=candidate_student_id,
            sex='Other',
            age=self._parse_age(age),
            first_name=first_name,
            last_name=last_name,
            is_active=True,
        )
        user.set_unusable_password()
        user.save(update_fields=['password'])
        return user

    def _resolve_user(self, request, create_from_external=False):
        if getattr(request.user, 'is_authenticated', False):
            return request.user

        raw_user_id = request.data.get('user_id') or request.query_params.get('user_id')
        if raw_user_id not in (None, ''):
            try:
                return User.objects.get(pk=int(raw_user_id))
            except (TypeError, ValueError, User.DoesNotExist):
                return None

        external_user_key = (
            request.data.get('external_user_key')
            or request.query_params.get('external_user_key')
            or request.data.get('phone')
            or request.query_params.get('phone')
        )

        if external_user_key in (None, ''):
            return None

        if create_from_external:
            return self._get_or_create_portal_user(
                external_user_key,
                display_name=request.data.get('owner_name') or request.data.get('name') or '',
                age=request.data.get('age'),
            )

        return self._find_portal_user(external_user_key)


class OTPRequestAPIView(PortalUserResolutionMixin, APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    OTP_VALIDITY_MINUTES = 15

    @staticmethod
    def _normalize_phone(phone_number):
        return re.sub(r'[\s\-().]', '', str(phone_number or '')).strip()

    @staticmethod
    def _cleanup_expired_otps():
        OTPVerificationCode.objects.filter(
            Q(expires_at__lte=timezone.now()) | Q(is_used=True)
        ).delete()

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        purpose = serializer.validated_data['purpose']
        phone_number = self._normalize_phone(serializer.validated_data['phone_number'])
        if not phone_number:
            return Response({'detail': 'Valid phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if purpose == OTPPurpose.ADMIN and not self._is_admin_phone(phone_number):
            return Response({'detail': 'This phone number is not authorized for admin access.'}, status=status.HTTP_403_FORBIDDEN)

        self._cleanup_expired_otps()

        OTPVerificationCode.objects.filter(
            phone_number=phone_number,
            purpose=purpose,
            is_used=False,
        ).delete()

        otp_code = f"{secrets.randbelow(1_000_000):06d}"
        expires_at = timezone.now() + timedelta(minutes=self.OTP_VALIDITY_MINUTES)

        OTPVerificationCode.objects.create(
            phone_number=phone_number,
            otp_code=otp_code,
            purpose=purpose,
            expires_at=expires_at,
        )

        print(f"[OTP] purpose={purpose} phone={phone_number} otp={otp_code} expires_at={expires_at.isoformat()}")

        return Response(
            {
                'detail': 'OTP generated successfully.',
                'expires_in_seconds': self.OTP_VALIDITY_MINUTES * 60,
            },
            status=status.HTTP_200_OK,
        )


class OTPVerifyAPIView(PortalUserResolutionMixin, APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @staticmethod
    def _normalize_phone(phone_number):
        return re.sub(r'[\s\-().]', '', str(phone_number or '')).strip()

    @staticmethod
    def _cleanup_expired_otps():
        OTPVerificationCode.objects.filter(
            Q(expires_at__lte=timezone.now()) | Q(is_used=True)
        ).delete()

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        purpose = serializer.validated_data['purpose']
        phone_number = self._normalize_phone(serializer.validated_data['phone_number'])
        otp_code = serializer.validated_data['otp_code']

        if purpose == OTPPurpose.ADMIN and not self._is_admin_phone(phone_number):
            return Response({'detail': 'This phone number is not authorized for admin access.'}, status=status.HTTP_403_FORBIDDEN)

        self._cleanup_expired_otps()
        now = timezone.now()

        otp_record = OTPVerificationCode.objects.filter(
            phone_number=phone_number,
            purpose=purpose,
            otp_code=otp_code,
            is_used=False,
            expires_at__gt=now,
        ).order_by('-created_at').first()

        if otp_record is None:
            return Response({'detail': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_record.is_used = True
        otp_record.save(update_fields=['is_used'])
        otp_record.delete()

        role = 'admin' if purpose == OTPPurpose.ADMIN else 'user'
        response_data = {
            'detail': 'OTP verified successfully.',
            'verified': True,
            'role': role,
            'phone_number': phone_number,
        }

        if purpose == OTPPurpose.USER:
            user = self._get_or_create_portal_user(
                phone_number,
                display_name=request.data.get('name') or '',
                age=request.data.get('age'),
            )
            response_data['user_id'] = user.id if user else None

        return Response(response_data, status=status.HTTP_200_OK)


class PredictAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PredictionRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        fastapi_payload = FraudScoringService.build_fastapi_payload(serializer.validated_data)
        fastapi_output = FraudScoringService.call_fastapi_predict(fastapi_payload)

        if not fastapi_output:
            return Response(
                {
                    "detail": "FastAPI Random Forest service is unavailable or did not return a valid prediction.",
                    "endpoint": "http://127.0.0.1:8000/predict",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {
                "prediction": fastapi_output["prediction"],
                "fraud_probability": fastapi_output["fraud_probability"],
                "legitimate_probability": fastapi_output.get("legitimate_probability"),
                "risk_level": fastapi_output["risk_level"],
                "model_source": "fastapi-random-forest",
            },
            status=status.HTTP_200_OK,
        )


class ProjectVerificationAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        report = ProjectVerificationService.build_report()
        return Response(report, status=status.HTTP_200_OK)


class UserGovernanceAPIView(PortalUserResolutionMixin, APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @staticmethod
    def _role_for_user(user):
        if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
            return 'Admin'
        if str(getattr(user, 'username', '')).startswith('portal_'):
            return 'Portal User'
        return 'User'

    @staticmethod
    def _status_for_user(is_active, risk_score, flagged_rate, rejected_loan_rate, total_transactions, total_loans):
        if not is_active:
            return 'Blocked'
        if risk_score >= 70 or flagged_rate >= 0.25 or rejected_loan_rate >= 0.50:
            return 'Flagged'
        if total_transactions > 0 or total_loans > 0:
            return 'Verified'
        return 'Neutral'

    def get(self, request):
        if not self._is_admin_view_request(request):
            return Response(
                {'detail': 'Admin scope is required for this endpoint.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        last_30_days = timezone.now() - timedelta(days=30)
        users_qs = User.objects.annotate(
            total_transactions=Count('transactions', distinct=True),
            flagged_transactions=Count(
                'transactions',
                filter=Q(transactions__status=TransactionStatus.FLAGGED),
                distinct=True,
            ),
            monthly_volume=Sum(
                'transactions__amount',
                filter=Q(transactions__created_at__gte=last_30_days),
            ),
            average_transaction_amount=Avg('transactions__amount'),
            total_loans=Count('loan_requests', distinct=True),
            rejected_loans=Count(
                'loan_requests',
                filter=Q(loan_requests__status=LoanRequestStatus.REJECTED),
                distinct=True,
            ),
            approved_loans=Count(
                'loan_requests',
                filter=Q(loan_requests__status=LoanRequestStatus.APPROVED),
                distinct=True,
            ),
            latest_transaction_at=Max('transactions__created_at'),
            latest_loan_update=Max('loan_requests__updated_at'),
        ).order_by('-signup_time')

        total_users = users_qs.count()
        active_users = users_qs.filter(is_active=True).count()
        inactive_users = total_users - active_users

        users_payload = []
        flagged_users = 0
        blocked_users = 0
        verified_users = 0
        neutral_users = 0
        risk_total = Decimal('0')
        trust_total = Decimal('0')
        monthly_volume_total = Decimal('0')

        for user in users_qs[:100]:
            total_transactions = int(user.total_transactions or 0)
            flagged_transactions = int(user.flagged_transactions or 0)
            total_loans = int(user.total_loans or 0)
            rejected_loans = int(user.rejected_loans or 0)
            approved_loans = int(user.approved_loans or 0)

            monthly_volume = Decimal(user.monthly_volume or 0)
            average_transaction_amount = Decimal(user.average_transaction_amount or 0)

            flagged_rate = (
                Decimal(flagged_transactions) / Decimal(total_transactions)
                if total_transactions > 0
                else Decimal('0')
            )
            rejected_loan_rate = (
                Decimal(rejected_loans) / Decimal(total_loans)
                if total_loans > 0
                else Decimal('0')
            )

            inactivity_penalty = Decimal('15') if total_transactions == 0 and total_loans == 0 else Decimal('0')
            blocked_penalty = Decimal('25') if not user.is_active else Decimal('0')
            risk_score = min(
                Decimal('100'),
                (flagged_rate * Decimal('55')) + (rejected_loan_rate * Decimal('30')) + inactivity_penalty + blocked_penalty,
            )
            trust_percent = max(Decimal('0'), Decimal('100') - risk_score)
            score = int((trust_percent / Decimal('100')) * Decimal('850'))

            status_label = self._status_for_user(
                user.is_active,
                float(risk_score),
                float(flagged_rate),
                float(rejected_loan_rate),
                total_transactions,
                total_loans,
            )

            if status_label == 'Flagged':
                flagged_users += 1
            elif status_label == 'Blocked':
                blocked_users += 1
            elif status_label == 'Verified':
                verified_users += 1
            else:
                neutral_users += 1

            role = self._role_for_user(user)
            display_name = user.get_full_name() or user.username
            last_activity = max(
                [dt for dt in [user.latest_transaction_at, user.latest_loan_update, user.signup_time] if dt],
                default=user.signup_time,
            )

            risk_total += risk_score
            trust_total += trust_percent
            monthly_volume_total += monthly_volume

            users_payload.append(
                {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'student_id': user.student_id,
                    'full_name': display_name,
                    'sex': user.sex,
                    'age': user.age,
                    'signup_time': user.signup_time,
                    'is_active': user.is_active,
                    'role': role,
                    'status': status_label,
                    'score': score,
                    'trust': float(round(trust_percent, 2)),
                    'risk': float(round(risk_score, 2)),
                    'monthly_volume': float(round(monthly_volume, 2)),
                    'average_transaction_amount': float(round(average_transaction_amount, 2)),
                    'total_transactions': total_transactions,
                    'flagged_transactions': flagged_transactions,
                    'flagged_rate_percent': float(round(flagged_rate * Decimal('100'), 2)),
                    'total_loans': total_loans,
                    'approved_loans': approved_loans,
                    'rejected_loans': rejected_loans,
                    'rejected_loan_rate_percent': float(round(rejected_loan_rate * Decimal('100'), 2)),
                    'last_activity_at': last_activity,
                }
            )

        divisor = Decimal(max(len(users_payload), 1))

        return Response(
            {
                'summary': {
                    'total_users': total_users,
                    'active_users': active_users,
                    'inactive_users': inactive_users,
                    'flagged_users': flagged_users,
                    'blocked_users': blocked_users,
                    'verified_users': verified_users,
                    'neutral_users': neutral_users,
                    'average_risk': float(round(risk_total / divisor, 2)),
                    'average_trust': float(round(trust_total / divisor, 2)),
                    'monthly_volume_total': float(round(monthly_volume_total, 2)),
                },
                'users': users_payload,
            },
            status=status.HTTP_200_OK,
        )


class ModelMonitoringAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_assessments = FraudAssessment.objects.count()
        flagged_assessments = FraudAssessment.objects.filter(prediction=1).count()

        risk_breakdown = {
            'low': FraudAssessment.objects.filter(risk_level=RiskLevelType.LOW).count(),
            'medium': FraudAssessment.objects.filter(risk_level=RiskLevelType.MEDIUM).count(),
            'high': FraudAssessment.objects.filter(risk_level=RiskLevelType.HIGH).count(),
        }

        aggregates = FraudAssessment.objects.aggregate(
            avg_fraud_probability=Avg('fraud_probability'),
        )

        trust_aggregates = TransactionTrust.objects.aggregate(
            avg_confidence_score=Avg('confidence_score'),
            total=Count('id'),
        )

        confidence_aggregates = ConfidenceScore.objects.aggregate(
            avg_confidence_level=Avg('confidence_level'),
            total=Count('id'),
        )

        return Response(
            {
                'summary': {
                    'total_assessments': total_assessments,
                    'flagged_assessments': flagged_assessments,
                    'avg_fraud_probability': float(aggregates['avg_fraud_probability'] or 0.0),
                    'avg_confidence_score': float(trust_aggregates['avg_confidence_score'] or 0.0),
                    'avg_confidence_level': float(confidence_aggregates['avg_confidence_level'] or 0.0),
                },
                'risk_breakdown': risk_breakdown,
                'totals': {
                    'trust_metrics': trust_aggregates['total'] or 0,
                    'confidence_scores': confidence_aggregates['total'] or 0,
                },
            },
            status=status.HTTP_200_OK,
        )


class UserTrustProfileViewSet(PortalUserResolutionMixin, viewsets.ReadOnlyModelViewSet):
    queryset = UserTrustProfile.objects.select_related('user').all().order_by('-updated_at')
    serializer_class = UserTrustProfileSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        base_queryset = UserTrustProfile.objects.select_related('user').all().order_by('-updated_at')
        if self._is_admin_view_request(self.request):
            return base_queryset
        user = self._resolve_user(self.request, create_from_external=False)
        if user is None:
            return base_queryset.none()
        return base_queryset.filter(user=user)


class NotificationViewSet(PortalUserResolutionMixin, viewsets.ReadOnlyModelViewSet):
    queryset = SystemNotification.objects.select_related('recipient_user').all().order_by('-created_at')
    serializer_class = SystemNotificationSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        base_queryset = SystemNotification.objects.select_related('recipient_user').all().order_by('-created_at')
        if self._is_admin_view_request(self.request):
            return base_queryset.filter(recipient_scope=NotificationRecipientScope.ADMIN)

        user = self._resolve_user(self.request, create_from_external=False)
        if user is None:
            return base_queryset.none()

        return base_queryset.filter(
            recipient_scope=NotificationRecipientScope.USER,
            recipient_user=user,
        )

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.delivery_status = NotificationDeliveryStatus.READ
        notification.read_at = timezone.now()
        notification.save(update_fields=['delivery_status', 'read_at'])
        return Response(self.get_serializer(notification).data, status=status.HTTP_200_OK)


class RiskAlertViewSet(PortalUserResolutionMixin, viewsets.ReadOnlyModelViewSet):
    queryset = RiskAlert.objects.select_related('user', 'transaction').all().order_by('-detected_at')
    serializer_class = RiskAlertSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        base_queryset = RiskAlert.objects.select_related('user', 'transaction').all().order_by('-detected_at')
        if self._is_admin_view_request(self.request):
            return base_queryset
        user = self._resolve_user(self.request, create_from_external=False)
        if user is None:
            return base_queryset.none()
        return base_queryset.filter(user=user)

    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve_alert(self, request, pk=None):
        alert = self.get_object()
        is_admin = self._is_admin_view_request(request)
        resolved_user = self._resolve_user(request, create_from_external=False)

        if not is_admin and (resolved_user is None or alert.user_id != resolved_user.id):
            return Response({'detail': 'Not authorized to resolve this alert.'}, status=status.HTTP_403_FORBIDDEN)

        if alert.status != RiskAlertStatus.OPEN:
            return Response(self.get_serializer(alert).data, status=status.HTTP_200_OK)

        alert.status = RiskAlertStatus.RESOLVED
        alert.resolved_at = timezone.now()
        alert.save(update_fields=['status', 'resolved_at', 'updated_at'])
        return Response(self.get_serializer(alert).data, status=status.HTTP_200_OK)


class FraudFeedbackViewSet(PortalUserResolutionMixin, viewsets.ReadOnlyModelViewSet):
    queryset = FraudFeedbackRecord.objects.select_related('user', 'transaction', 'loan_request').all().order_by('-created_at')
    serializer_class = FraudFeedbackRecordSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        base_queryset = FraudFeedbackRecord.objects.select_related('user', 'transaction', 'loan_request').all().order_by('-created_at')
        if self._is_admin_view_request(self.request):
            return base_queryset
        user = self._resolve_user(self.request, create_from_external=False)
        if user is None:
            return base_queryset.none()
        return base_queryset.filter(user=user)

    @action(detail=True, methods=['post'], url_path='actual-outcome')
    def set_actual_outcome(self, request, pk=None):
        if not self._is_admin_view_request(request):
            return Response({'detail': 'Admin scope is required to set actual outcomes.'}, status=status.HTTP_403_FORBIDDEN)

        record = self.get_object()
        serializer = FraudFeedbackOutcomeUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        FraudFeedbackService.set_actual_outcome(
            record,
            serializer.validated_data['actual_outcome'],
            serializer.validated_data.get('note', ''),
        )
        return Response(self.get_serializer(record).data, status=status.HTTP_200_OK)


class TransactionViewSet(PortalUserResolutionMixin, viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-created_at')
    serializer_class = TransactionSerializer
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        base_queryset = Transaction.objects.all().order_by('-created_at')
        if self._is_admin_view_request(self.request):
            return base_queryset
        user = self._resolve_user(self.request, create_from_external=False)
        if user is None:
            return base_queryset.none()
        if getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False):
            return base_queryset
        return base_queryset.filter(user=user)

    def _ingest_and_score(self, request):
        """Shared ingestion and scoring flow used by both ingest and orchestrate endpoints."""
        serializer = TransactionUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        source_type = serializer.validated_data.get('source_type')
        device_id = serializer.validated_data.get('device_id')
        ip_address = serializer.validated_data.get('ip_address')
        uploaded_file = serializer.validated_data.get('file')
        raw_text_input = serializer.validated_data.get('raw_text')

        user = self._resolve_user(request, create_from_external=True)
        if user is None:
            return Response(
                {
                    'detail': 'Authentication required or provide user_id/external_user_key.',
                    'required': ['user_id', 'external_user_key'],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        parsed_data = {}
        source_confidence = SOURCE_CONFIDENCE_BY_TYPE.get(source_type, 'low')
        source_confidence_score = {
            'high': 0.9,
            'medium': 0.65,
            'low': 0.35,
        }.get(source_confidence, 0.35)

        ocr_service = None
        if source_type in {'screenshot', 'pdf', 'sms'}:
            try:
                from .ocr_service import OCRService

                ocr_service = OCRService
            except ModuleNotFoundError:
                return Response(
                    {
                        'detail': 'OCR dependencies are not installed. Install opencv-python and pytesseract.',
                        'source_type': source_type,
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

        # Case 1: Screenshot/PDF (OCR required)
        if source_type in {'screenshot', 'pdf'} and uploaded_file:
            suffix = os.path.splitext(uploaded_file.name)[1] or ('.pdf' if source_type == 'pdf' else '.png')
            temp_path = f"temp_{uuid.uuid4()}{suffix}"
            try:
                with open(temp_path, 'wb+') as destination:
                    for chunk in uploaded_file.chunks():
                        destination.write(chunk)

                parsed_data = ocr_service.process_document(temp_path)
            except Exception as exc:
                # Surface a clear API error when the Tesseract binary is not installed.
                if exc.__class__.__name__ == 'TesseractNotFoundError':
                    return Response(
                        {
                            'detail': 'Tesseract OCR engine is not installed or not in PATH. Install Tesseract and restart Django.',
                            'source_type': source_type,
                        },
                        status=status.HTTP_503_SERVICE_UNAVAILABLE,
                    )
                raise
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        # Case 2: SMS
        elif source_type == 'sms' and raw_text_input:
            parsed_data = ocr_service.parse_transaction_data(raw_text_input)
            parsed_data['raw_text'] = raw_text_input

        # Case 3: Manual
        elif source_type == 'manual':
            parsed_data = {
                'amount': request.data.get('amount', 0),
                'purchase_time': request.data.get('purchase_time'),
                'parsing_success': True,
                'validation_score': 1.0,
            }

        if parsed_data is None:
            parsed_data = {}

        if not parsed_data.get('amount'):
            parsed_data['amount'] = request.data.get('amount', 0)
        if not parsed_data.get('purchase_time'):
            parsed_data['purchase_time'] = request.data.get('purchase_time')
        parsed_data.setdefault('parsing_success', True)
        parsed_data.setdefault('parsing_success_score', 1.0)
        parsed_data.setdefault('validation_score', 1.0)

        txn = Transaction.objects.create(
            user=user,
            amount=parsed_data.get('amount', 0),
            status='pending',
            device_id=device_id,
            ip_address=ip_address,
            data_source=source_type,
            source_confidence=source_confidence,
            parsing_success=parsed_data.get('parsing_success', False),
            validation_score=parsed_data.get('validation_score', 0.0),
            purchase_time=parsed_data.get('purchase_time', None)
        )

        score_payload = {
            'user_id': user.id,
            'signup_time': user.signup_time,
            'purchase_time': txn.purchase_time,
            'purchase_value': txn.amount,
            'age': user.age or request.data.get('age', 0),
            'ip_address': ip_address,
            'user_transaction_count': Transaction.objects.filter(user=user, purchase_time__lte=txn.purchase_time).count(),
            'device_transaction_count': Transaction.objects.filter(device_id=device_id, purchase_time__lte=txn.purchase_time).count(),
            'source_type': source_type,
            'device_id': device_id,
            'sex': user.sex,
            'parsing_success': parsed_data.get('parsing_success_score', 1.0),
            'source_confidence': source_confidence_score,
        }

        local_score = FraudScoringService.score_payload(score_payload)
        fastapi_payload = FraudScoringService.build_fastapi_payload(score_payload)
        external_output = FraudScoringService.call_fastapi_predict(fastapi_payload)
        score = FraudScoringService.blend_with_external_model(local_score, external_output)

        FraudScoringService.persist_transaction_scores(txn, score)

        txn.status = 'flagged' if score.prediction == 1 else 'completed'
        txn.save(update_fields=['status'])

        if not parsed_data.get('parsing_success'):
            ValidationLog.objects.create(
                transaction=txn,
                check_type='parsing',
                check_passed=False,
                message="Failed to extract structured data from source."
            )
        else:
            ValidationLog.objects.create(
                transaction=txn,
                check_type='parsing',
                check_passed=True,
                message=f"Successfully parsed data from {source_type}."
            )

        system_events = BackgroundAutomationService.handle_transaction_event(txn, score)

        response_data = TransactionSerializer(txn).data
        response_data['fraud_assessment'] = score.to_output()
        response_data['analysis'] = {
            'model_source': 'ensemble(local+fastapi)' if external_output else 'local-fallback',
            'fastapi_payload': fastapi_payload,
            'fastapi_output': external_output,
            'ocr_reliability': round(float(parsed_data.get('parsing_success_score', 1.0)), 4),
            'source_confidence': round(float(source_confidence_score), 4),
            'behavioral_flags': score.flags,
            'confidence_reasoning': {
                'time_since_signup_hours': round(float(score.time_since_signup), 4),
                'purchase_deviation': round(float(score.purchase_deviation), 4),
                'validation_score': round(float(score.validation_score), 4),
            },
        }
        response_data['system_events'] = system_events
        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='ingest')
    def ingest(self, request):
        """Unified endpoint for transaction ingestion from multiple sources."""
        return self._ingest_and_score(request)

    @action(detail=False, methods=['post'], url_path='orchestrate')
    def orchestrate(self, request):
        """Single-call flow: verify project readiness, then ingest and score."""
        verification_report = ProjectVerificationService.build_report()
        continue_on_gaps = self._as_bool(request.data.get('continue_on_gaps'), default=False)

        if verification_report.get('missing') and not continue_on_gaps:
            return Response(
                {
                    'verification': verification_report,
                    'execution': {
                        'status': 'blocked',
                        'reason': 'Required verification gaps found. Set continue_on_gaps=true to force execution.',
                    },
                },
                status=status.HTTP_412_PRECONDITION_FAILED,
            )

        ingest_response = self._ingest_and_score(request)
        execution_status = 'completed' if ingest_response.status_code < 400 else 'failed'

        return Response(
            {
                'verification': verification_report,
                'execution': {
                    'status': execution_status,
                    'result': ingest_response.data,
                },
            },
            status=ingest_response.status_code,
        )

    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        """Return scoped fraud stats for the resolved user context."""
        scoped_queryset = self.get_queryset()
        total_transactions = scoped_queryset.count()
        completed_count = scoped_queryset.filter(status=TransactionStatus.COMPLETED).count()
        pending_count = scoped_queryset.filter(status=TransactionStatus.PENDING).count()
        flagged_count = scoped_queryset.filter(status=TransactionStatus.FLAGGED).count()
        failed_count = scoped_queryset.filter(status=TransactionStatus.FAILED).count()
        reversed_count = scoped_queryset.filter(status=TransactionStatus.REVERSED).count()

        rejected_count = flagged_count + failed_count + reversed_count
        risk_distribution = {
            'low': scoped_queryset.filter(trust_metrics__risk_level=RiskLevelType.LOW).count(),
            'medium': scoped_queryset.filter(trust_metrics__risk_level=RiskLevelType.MEDIUM).count(),
            'high': scoped_queryset.filter(trust_metrics__risk_level=RiskLevelType.HIGH).count(),
        }

        overall_score = min(
            850,
            680 + (completed_count * 12) + min(100, total_transactions * 4) - (flagged_count * 6),
        )
        data_quality = max(
            0,
            min(99, 78 + min(10, completed_count) + min(12, total_transactions)),
        )
        risk_level = 'Elevated' if flagged_count > 0 else ('Minimal' if total_transactions > 0 else 'Unknown')

        return Response({
            'total_transactions': total_transactions,
            'completed_count': completed_count,
            'pending_count': pending_count,
            'rejected_count': rejected_count,
            'flagged_count': flagged_count,
            'risk_distribution': risk_distribution,
            'overall_score': overall_score,
            'data_quality': data_quality,
            'risk_level': risk_level,
            'computation': {
                'overall_score': {
                    'formula': 'min(850, 680 + completed_count*12 + min(100, total_transactions*4) - flagged_count*6)',
                    'inputs': {
                        'base': 680,
                        'completed_count': completed_count,
                        'total_transactions': total_transactions,
                        'flagged_count': flagged_count,
                        'per_completed_weight': 12,
                        'per_transaction_weight': 4,
                        'transaction_bonus_cap': 100,
                        'flagged_penalty_weight': 6,
                        'score_cap': 850,
                    },
                    'result': overall_score,
                },
                'data_quality': {
                    'formula': 'max(0, min(99, 78 + min(10, completed_count) + min(12, total_transactions)))',
                    'inputs': {
                        'base': 78,
                        'completed_count': completed_count,
                        'completed_bonus_cap': 10,
                        'total_transactions': total_transactions,
                        'transaction_bonus_cap': 12,
                        'floor': 0,
                        'cap': 99,
                    },
                    'result': data_quality,
                },
            },
        })


class LoanRequestViewSet(PortalUserResolutionMixin, viewsets.ModelViewSet):
    queryset = LoanRequest.objects.select_related('user', 'decided_by').all().order_by('-created_at')
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        base_queryset = LoanRequest.objects.select_related('user', 'decided_by').all().order_by('-created_at')
        if self._is_admin_view_request(self.request):
            return base_queryset
        user = self._resolve_user(self.request, create_from_external=False)
        if user is None:
            return base_queryset.none()
        if getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False):
            return base_queryset
        return base_queryset.filter(user=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return LoanRequestCreateSerializer
        return LoanRequestSerializer

    def _risk_from_score(self, score: Decimal) -> str:
        if score >= Decimal('0.65'):
            return RiskLevelType.HIGH
        if score >= Decimal('0.30'):
            return RiskLevelType.MEDIUM
        return RiskLevelType.LOW

    def create(self, request, *args, **kwargs):
        user = self._resolve_user(request, create_from_external=True)
        if user is None:
            return Response(
                {'detail': 'Authentication required or provide user_id/external_user_key.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = LoanRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        loan_request = LoanRequest.objects.create(
            user=user,
            requested_amount=serializer.validated_data['requested_amount'],
            requested_tenure_months=serializer.validated_data['requested_tenure_months'],
            stated_income=serializer.validated_data['stated_income'],
            purpose=serializer.validated_data.get('purpose'),
            status=LoanRequestStatus.SUBMITTED,
        )
        BackgroundAutomationService.handle_loan_event(loan_request, event_type='submitted')

        output = LoanRequestSerializer(loan_request).data
        return Response(
            {
                'message': 'Loan request accepted for asynchronous evaluation.',
                'request_id': loan_request.id,
                'status': loan_request.status,
                'data': output,
            },
            status=status.HTTP_202_ACCEPTED,
        )

    @action(detail=True, methods=['get'], url_path='status')
    def status_view(self, request, pk=None):
        loan_request = self.get_object()
        return Response(LoanStatusSerializer(loan_request).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='evaluate')
    def evaluate(self, request, pk=None):
        loan_request = self.get_object()

        if loan_request.status in {LoanRequestStatus.APPROVED, LoanRequestStatus.REJECTED}:
            return Response(
                {'detail': 'Finalized request cannot be re-evaluated.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        loan_request.status = LoanRequestStatus.EVALUATING
        loan_request.save(update_fields=['status', 'updated_at'])

        # Build a synthetic scoring payload using the existing fraud engine.
        now = timezone.now()
        user = loan_request.user
        input_ip = request.data.get('ip_address', '127.0.0.1')
        try:
            safe_ip = str(ip_address(str(input_ip)))
        except ValueError:
            safe_ip = '127.0.0.1'

        score_payload = {
            'user_id': user.id,
            'signup_time': user.signup_time,
            'purchase_time': now,
            'purchase_value': loan_request.requested_amount,
            'age': user.age or 18,
            'ip_address': safe_ip,
            'user_transaction_count': Transaction.objects.filter(user=user).count() + 1,
            'device_transaction_count': 1,
            'source_type': 'manual',
            'device_id': f'loan-request-{loan_request.id}',
            'sex': user.sex,
            'parsing_success': 1.0,
            'source_confidence': 0.9,
        }

        fraud_score = FraudScoringService.score_payload(score_payload)

        income = loan_request.stated_income if loan_request.stated_income > 0 else Decimal('1')
        debt_ratio = (loan_request.requested_amount / income)
        affordability_penalty = Decimal('0.10') if debt_ratio > Decimal('0.6') else Decimal('0.00')
        ai_score = min(Decimal('0.99'), fraud_score.fraud_probability + affordability_penalty)
        ai_risk_level = self._risk_from_score(ai_score)
        ai_recommendation = (
            LoanAIRecommendation.REJECT
            if ai_score >= Decimal('0.50')
            else LoanAIRecommendation.APPROVE
        )

        flagged_history_count = Transaction.objects.filter(user=user, status=TransactionStatus.FLAGGED).count()
        historical_transaction_count = max(score_payload['user_transaction_count'] - 1, 0)

        readable_flags = [flag.replace('_', ' ') for flag in fraud_score.flags]
        risk_points = []
        if ai_score >= Decimal('0.50'):
            risk_points.append(
                f"overall risk score {float(ai_score):.2f} is above the reject threshold of 0.50"
            )
        if debt_ratio > Decimal('0.60'):
            risk_points.append(
                f"loan-to-income ratio is {float(debt_ratio * Decimal('100')):.1f}% (safe range <= 60.0%)"
            )
        if affordability_penalty > 0:
            risk_points.append(
                f"affordability penalty added {float(affordability_penalty * Decimal('100')):.1f}% to risk"
            )
        if flagged_history_count > 0:
            risk_points.append(
                f"user has {flagged_history_count} flagged transaction(s) in history"
            )
        if readable_flags:
            risk_points.append(
                f"fraud signals observed: {', '.join(readable_flags[:4])}"
            )
        risk_points.append(
            f"historical transaction count considered: {historical_transaction_count}"
        )

        loan_request.ai_score = ai_score
        loan_request.ai_risk_level = ai_risk_level
        loan_request.ai_recommendation = ai_recommendation
        loan_request.decision_reasoning = '; '.join(risk_points) + '.'
        loan_request.status = LoanRequestStatus.EVALUATED
        loan_request.evaluated_at = now
        loan_request.save(
            update_fields=[
                'ai_score',
                'ai_risk_level',
                'ai_recommendation',
                'decision_reasoning',
                'status',
                'evaluated_at',
                'updated_at',
            ]
        )
        BackgroundAutomationService.handle_loan_event(loan_request, event_type='evaluated')

        return Response(LoanRequestSerializer(loan_request).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        loan_request = self.get_object()
        decision_serializer = LoanDecisionSerializer(data=request.data)
        decision_serializer.is_valid(raise_exception=True)

        if loan_request.status == LoanRequestStatus.REJECTED:
            return Response({'detail': 'Rejected request cannot be approved.'}, status=status.HTTP_400_BAD_REQUEST)

        loan_request.status = LoanRequestStatus.APPROVED
        loan_request.admin_decision_note = decision_serializer.validated_data.get('note')
        loan_request.decided_at = timezone.now()
        loan_request.decided_by = request.user if getattr(request.user, 'is_authenticated', False) else None
        loan_request.save(update_fields=['status', 'admin_decision_note', 'decided_at', 'decided_by', 'updated_at'])
        BackgroundAutomationService.handle_loan_event(loan_request, event_type='approved')

        return Response(LoanRequestSerializer(loan_request).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        loan_request = self.get_object()
        decision_serializer = LoanDecisionSerializer(data=request.data)
        decision_serializer.is_valid(raise_exception=True)

        if loan_request.status == LoanRequestStatus.APPROVED:
            return Response({'detail': 'Approved request cannot be rejected.'}, status=status.HTTP_400_BAD_REQUEST)

        loan_request.status = LoanRequestStatus.REJECTED
        loan_request.admin_decision_note = decision_serializer.validated_data.get('note')
        loan_request.decided_at = timezone.now()
        loan_request.decided_by = request.user if getattr(request.user, 'is_authenticated', False) else None
        loan_request.save(update_fields=['status', 'admin_decision_note', 'decided_at', 'decided_by', 'updated_at'])
        BackgroundAutomationService.handle_loan_event(loan_request, event_type='rejected')

        return Response(LoanRequestSerializer(loan_request).data, status=status.HTTP_200_OK)
