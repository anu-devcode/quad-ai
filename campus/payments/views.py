import os
import uuid

from decimal import Decimal
from ipaddress import ip_address

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from django.utils import timezone

from .models import FraudAssessment, LoanAIRecommendation, LoanRequest, LoanRequestStatus, RiskLevelType, Transaction, User, ValidationLog
from .project_verifier import ProjectVerificationService
from .serializers import LoanDecisionSerializer, LoanRequestCreateSerializer, LoanRequestSerializer, LoanStatusSerializer, PredictionRequestSerializer, TransactionSerializer, TransactionUploadSerializer
from .services import FraudScoringService, SOURCE_CONFIDENCE_BY_TYPE


class PredictAPIView(APIView):
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
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        report = ProjectVerificationService.build_report()
        return Response(report, status=status.HTTP_200_OK)


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-created_at')
    serializer_class = TransactionSerializer
    permission_classes = [permissions.AllowAny]

    @staticmethod
    def _as_bool(value, default=False):
        if value is None:
            return default
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return value != 0
        return str(value).strip().lower() in {"1", "true", "yes", "y", "on"}

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

        user = request.user if getattr(request.user, 'is_authenticated', False) else None
        if user is None:
            raw_user_id = request.data.get('user_id')
            if raw_user_id in (None, ''):
                return Response(
                    {
                        'detail': 'Authentication required or provide user_id in the request body.',
                        'required': ['user_id'],
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                user = User.objects.get(pk=int(raw_user_id))
            except (TypeError, ValueError):
                return Response(
                    {'detail': 'user_id must be a valid integer.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except User.DoesNotExist:
                return Response(
                    {'detail': 'No user found for provided user_id.'},
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
        """Admin/Global statistics for fraud trends."""
        total_transactions = Transaction.objects.count()
        flagged_count = Transaction.objects.filter(status='flagged').count()
        risk_distribution = {
            'low': Transaction.objects.filter(trust_metrics__risk_level='Low').count(),
            'medium': Transaction.objects.filter(trust_metrics__risk_level='Medium').count(),
            'high': Transaction.objects.filter(trust_metrics__risk_level='High').count(),
        }

        return Response({
            'total_transactions': total_transactions,
            'flagged_count': flagged_count,
            'risk_distribution': risk_distribution
        })


class LoanRequestViewSet(viewsets.ModelViewSet):
    queryset = LoanRequest.objects.select_related('user', 'decided_by').all().order_by('-created_at')
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'create':
            return LoanRequestCreateSerializer
        return LoanRequestSerializer

    def _resolve_user(self, request):
        if getattr(request.user, 'is_authenticated', False):
            return request.user

        raw_user_id = request.data.get('user_id') or request.query_params.get('user_id')
        if raw_user_id in (None, ''):
            return None
        try:
            return User.objects.get(pk=int(raw_user_id))
        except (TypeError, ValueError, User.DoesNotExist):
            return None

    def _risk_from_score(self, score: Decimal) -> str:
        if score >= Decimal('0.65'):
            return RiskLevelType.HIGH
        if score >= Decimal('0.30'):
            return RiskLevelType.MEDIUM
        return RiskLevelType.LOW

    def create(self, request, *args, **kwargs):
        user = self._resolve_user(request)
        if user is None:
            return Response(
                {'detail': 'Authentication required or provide user_id.'},
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

        loan_request.ai_score = ai_score
        loan_request.ai_risk_level = ai_risk_level
        loan_request.ai_recommendation = ai_recommendation
        loan_request.decision_reasoning = (
            f"Model score={float(fraud_score.fraud_probability):.4f}; "
            f"debt_ratio={float(debt_ratio):.4f}; "
            f"affordability_penalty={float(affordability_penalty):.4f}."
        )
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

        return Response(LoanRequestSerializer(loan_request).data, status=status.HTTP_200_OK)
