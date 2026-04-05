from __future__ import annotations

import json
from urllib import error as urllib_error
from urllib import request as urllib_request
from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
from ipaddress import ip_address as parse_ip_address
from typing import Any, Dict, Optional

from django.conf import settings
from django.db.models import Avg, Count
from django.utils import timezone

from .models import (
    ConfidenceScore,
    FraudActualOutcome,
    FraudAssessment,
    FraudFeedbackRecord,
    LoanAIRecommendation,
    NotificationCategory,
    NotificationRecipientScope,
    RiskAlert,
    RiskAlertSeverity,
    RiskAlertStatus,
    RiskLevelType,
    SystemNotification,
    Transaction,
    TransactionStatus,
    TransactionTrust,
    UserTrustProfile,
)


SOURCE_CONFIDENCE_BY_TYPE = {
    "sms": "high",
    "pdf": "high",
    "screenshot": "medium",
    "manual": "low",
}

SOURCE_CONFIDENCE_TO_SCORE = {
    "high": Decimal("0.90"),
    "medium": Decimal("0.65"),
    "low": Decimal("0.35"),
}


def _to_decimal(value: Any, default: Decimal | None = None) -> Decimal:
    if value is None:
        if default is not None:
            return default
        raise ValueError("A decimal value is required.")

    if isinstance(value, Decimal):
        return value

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError(f"Invalid decimal value: {value}") from exc


def _to_datetime(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value if timezone.is_aware(value) else timezone.make_aware(value)

    if isinstance(value, str):
        normalized = value.strip().replace("Z", "+00:00")
        try:
            parsed = datetime.fromisoformat(normalized)
            return parsed if timezone.is_aware(parsed) else timezone.make_aware(parsed)
        except ValueError as exc:
            raise ValueError(f"Invalid datetime value: {value}") from exc

    raise ValueError(f"Invalid datetime value: {value}")


def _to_ip_integer(value: Any) -> int:
    if value is None:
        raise ValueError("ip_address is required.")

    if isinstance(value, int):
        return value

    if isinstance(value, float):
        return int(value)

    text = str(value).strip()
    try:
        return int(parse_ip_address(text))
    except ValueError:
        try:
            return int(Decimal(text))
        except (InvalidOperation, ValueError) as exc:
            raise ValueError(f"Invalid IP address value: {value}") from exc


def _risk_level_for_probability(probability: Decimal) -> str:
    if probability > Decimal("0.7"):
        return RiskLevelType.HIGH
    if probability >= Decimal("0.2"):
        return RiskLevelType.MEDIUM
    return RiskLevelType.LOW


def _clamp_probability(probability: Decimal) -> Decimal:
    return max(Decimal("0.0"), min(probability, Decimal("0.99")))


def _to_ratio(value: Any, default: Decimal) -> Decimal:
    if value is None:
        return default

    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in SOURCE_CONFIDENCE_TO_SCORE:
            return SOURCE_CONFIDENCE_TO_SCORE[lowered]

    decimal_value = _to_decimal(value, default=default)
    return max(Decimal("0.0"), min(decimal_value, Decimal("1.0")))


def _confidence_bucket(score: Decimal) -> str:
    if score >= Decimal("0.80"):
        return "high"
    if score >= Decimal("0.55"):
        return "medium"
    return "low"


@dataclass
class FraudScoreResult:
    prediction: int
    fraud_probability: Decimal
    risk_level: str
    source_confidence: str
    parsing_success: bool
    validation_score: Decimal
    time_since_signup: Decimal
    purchase_deviation: Decimal
    user_transaction_count: int
    device_transaction_count: int
    flags: list[str]

    def to_output(self) -> Dict[str, Any]:
        return {
            "prediction": self.prediction,
            "fraud_probability": float(self.fraud_probability),
            "risk_level": self.risk_level,
        }


class FraudScoringService:
    @staticmethod
    def build_fastapi_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
        data = FraudScoringService.normalize_request_payload(payload)
        source_type = str(data.get("source_type") or "manual")

        return {
            "user_id": data["user_id"],
            "signup_time": data["signup_time"].strftime("%Y-%m-%d %H:%M:%S"),
            "purchase_time": data["purchase_time"].strftime("%Y-%m-%d %H:%M:%S"),
            "purchase_value": float(data["purchase_value"]),
            "device_id": str(data.get("device_id") or "unknown-device"),
            "source": source_type,
            "browser": str(data.get("browser") or "Unknown"),
            "sex": str(data.get("sex") or "Other"),
            "age": data["age"],
            "ip_address": float(data["ip_address"]),
            "user_transaction_count": data.get("user_transaction_count") or 1,
            "device_transaction_count": data.get("device_transaction_count") or 1,
            "user_avg_purchase": float(data.get("user_avg_purchase") or data["purchase_value"]),
            "parsing_success": float(data.get("parsing_success") or Decimal("1.0")),
            "source_confidence": float(data.get("source_confidence_score") or Decimal("0.35")),
        }

    @staticmethod
    def call_fastapi_predict(payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        endpoint = getattr(settings, "FRAUD_MODEL_API_URL", "http://127.0.0.1:8000/predict")
        timeout_seconds = int(getattr(settings, "FRAUD_MODEL_API_TIMEOUT_SECONDS", 5))
        body = json.dumps(payload).encode("utf-8")

        req = urllib_request.Request(
            endpoint,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib_request.urlopen(req, timeout=timeout_seconds) as resp:
                response_body = resp.read().decode("utf-8")
                parsed = json.loads(response_body)
                if all(k in parsed for k in ("prediction", "fraud_probability", "risk_level")):
                    return parsed
        except (urllib_error.URLError, urllib_error.HTTPError, TimeoutError, ValueError):
            return None

        return None

    @staticmethod
    def normalize_request_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
        normalized = dict(payload)
        normalized["user_id"] = int(normalized["user_id"])
        normalized["age"] = int(normalized["age"])
        normalized["purchase_value"] = _to_decimal(normalized["purchase_value"])
        normalized["signup_time"] = _to_datetime(normalized["signup_time"])
        normalized["purchase_time"] = _to_datetime(normalized["purchase_time"])
        normalized["ip_address"] = _to_ip_integer(normalized["ip_address"])
        normalized["user_transaction_count"] = int(normalized.get("user_transaction_count") or 1)
        normalized["device_transaction_count"] = int(normalized.get("device_transaction_count") or 1)
        normalized["source_type"] = str(normalized.get("source_type") or "manual").lower()
        source_confidence_default = SOURCE_CONFIDENCE_BY_TYPE.get(normalized["source_type"], "low")
        normalized["source_confidence_score"] = _to_ratio(normalized.get("source_confidence"), _to_ratio(source_confidence_default, Decimal("0.35")))
        normalized["source_confidence"] = _confidence_bucket(normalized["source_confidence_score"])
        normalized["parsing_success"] = _to_ratio(normalized.get("parsing_success"), Decimal("1.0"))
        return normalized

    @staticmethod
    def score_payload(payload: Dict[str, Any]) -> FraudScoreResult:
        data = FraudScoringService.normalize_request_payload(payload)

        purchase_value = _to_decimal(data["purchase_value"])
        signup_time = _to_datetime(data["signup_time"])
        purchase_time = _to_datetime(data["purchase_time"])
        source_confidence = str(data.get("source_confidence") or "low").lower()
        source_confidence_score = _to_ratio(data.get("source_confidence_score"), Decimal("0.35"))
        parsing_success_score = _to_ratio(data.get("parsing_success"), Decimal("1.0"))

        user_id = data["user_id"]
        user_history = Transaction.objects.filter(user_id=user_id, purchase_time__lt=purchase_time)
        device_identifier = data.get("device_id")
        device_history = Transaction.objects.none()
        if device_identifier:
            device_history = Transaction.objects.filter(device_id=device_identifier, purchase_time__lt=purchase_time)

        previous_user_count = user_history.count()
        previous_device_count = device_history.count()

        derived_user_transaction_count = max(int(data.get("user_transaction_count") or 1), previous_user_count + 1)
        derived_device_transaction_count = max(int(data.get("device_transaction_count") or 1), previous_device_count + 1)

        user_avg_purchase = user_history.aggregate(avg_amount=Avg("amount")).get("avg_amount") or purchase_value
        user_avg_purchase = _to_decimal(user_avg_purchase)
        purchase_deviation = purchase_value - user_avg_purchase

        time_since_signup_hours = Decimal(
            str(max((purchase_time - signup_time).total_seconds() / 3600.0, 0.0))
        )

        flags: list[str] = []
        probability = Decimal("0.05")

        if purchase_value <= 0:
            flags.append("non_positive_amount")
            probability += Decimal("0.45")
        elif purchase_value > Decimal("500"):
            probability += min(Decimal("0.25"), Decimal("0.12") + (purchase_value - Decimal("500")) / Decimal("5000"))

        if purchase_time < signup_time:
            flags.append("purchase_before_signup")
            probability = max(probability, Decimal("0.95"))
        elif time_since_signup_hours < Decimal("1"):
            flags.append("short_signup_interval")
            probability += Decimal("0.30")
        elif time_since_signup_hours < Decimal("24"):
            probability += Decimal("0.10")

        if purchase_deviation > max(user_avg_purchase * Decimal("0.50"), Decimal("0")):
            flags.append("large_purchase_spike")
            probability += Decimal("0.20")

        if derived_user_transaction_count <= 2 and purchase_value > Decimal("500"):
            flags.append("new_user_high_value_purchase")
            probability += Decimal("0.10")

        if derived_device_transaction_count > 5:
            flags.append("frequent_device_usage")
            probability += Decimal("0.15")

        if source_confidence == "medium":
            probability += Decimal("0.05")
        elif source_confidence == "low":
            probability += Decimal("0.10")

        if user_history.filter(amount=purchase_value, purchase_time=purchase_time).exists():
            flags.append("duplicate_transaction")
            probability += Decimal("0.15")

        if parsing_success_score < Decimal("0.50"):
            flags.append("ocr_parsing_failed")
            probability += Decimal("0.12")
        elif parsing_success_score < Decimal("0.80"):
            flags.append("ocr_parsing_uncertain")
            probability += Decimal("0.06")

        validation_penalty = Decimal("0.0")
        validation_penalty += min(Decimal("0.20"), Decimal("0.02") * max(previous_user_count, 0))
        validation_penalty += min(Decimal("0.10"), Decimal("0.02") * max(previous_device_count, 0))

        probability = _clamp_probability(probability)
        risk_level = _risk_level_for_probability(probability)
        prediction = 1 if probability >= Decimal("0.5") else 0
        validation_score = _clamp_probability(Decimal("1.0") - validation_penalty)

        return FraudScoreResult(
            prediction=prediction,
            fraud_probability=probability,
            risk_level=risk_level,
            source_confidence=source_confidence,
            parsing_success=parsing_success_score >= Decimal("0.80"),
            validation_score=validation_score,
            time_since_signup=time_since_signup_hours,
            purchase_deviation=purchase_deviation,
            user_transaction_count=derived_user_transaction_count,
            device_transaction_count=derived_device_transaction_count,
            flags=flags,
        )

    @staticmethod
    def blend_with_external_model(local_score: FraudScoreResult, external_output: Optional[Dict[str, Any]]) -> FraudScoreResult:
        if not external_output:
            return local_score

        try:
            external_probability = _clamp_probability(_to_decimal(external_output.get("fraud_probability"), default=local_score.fraud_probability))
            blended_probability = _clamp_probability((local_score.fraud_probability + external_probability) / Decimal("2"))
            prediction = 1 if blended_probability >= Decimal("0.5") else 0
            risk_level = _risk_level_for_probability(blended_probability)
        except ValueError:
            return local_score

        return FraudScoreResult(
            prediction=prediction,
            fraud_probability=blended_probability,
            risk_level=risk_level,
            source_confidence=local_score.source_confidence,
            parsing_success=local_score.parsing_success,
            validation_score=local_score.validation_score,
            time_since_signup=local_score.time_since_signup,
            purchase_deviation=local_score.purchase_deviation,
            user_transaction_count=local_score.user_transaction_count,
            device_transaction_count=local_score.device_transaction_count,
            flags=local_score.flags,
        )

    @staticmethod
    def persist_transaction_scores(transaction: Transaction, score: FraudScoreResult) -> None:
        ConfidenceScore.objects.update_or_create(
            transaction=transaction,
            defaults={
                "confidence_level": score.validation_score,
                "trust_level": score.risk_level,
            },
        )

        FraudAssessment.objects.update_or_create(
            transaction=transaction,
            defaults={
                "prediction": score.prediction,
                "fraud_probability": score.fraud_probability,
                "risk_level": score.risk_level,
            },
        )

        TransactionTrust.objects.update_or_create(
            transaction=transaction,
            defaults={
                "fraud_flag": score.prediction == 1,
                "confidence_score": score.validation_score,
                "risk_level": score.risk_level,
            },
        )


class TrustProfileService:
    @staticmethod
    def _risk_from_trust_score(trust_score: Decimal) -> str:
        if trust_score < Decimal('40'):
            return RiskLevelType.HIGH
        if trust_score < Decimal('70'):
            return RiskLevelType.MEDIUM
        return RiskLevelType.LOW

    @staticmethod
    def update_user_profile(user, event_type: str = 'transaction_update') -> UserTrustProfile:
        tx_queryset = Transaction.objects.filter(user=user)
        total_transactions = tx_queryset.count()
        flagged_transactions = tx_queryset.filter(status=TransactionStatus.FLAGGED).count()
        high_risk_transactions = tx_queryset.filter(trust_metrics__risk_level=RiskLevelType.HIGH).count()

        flagged_ratio = (
            Decimal(flagged_transactions) / Decimal(total_transactions)
            if total_transactions > 0
            else Decimal('0')
        )
        high_risk_ratio = (
            Decimal(high_risk_transactions) / Decimal(total_transactions)
            if total_transactions > 0
            else Decimal('0')
        )

        average_confidence = TransactionTrust.objects.filter(transaction__user=user).aggregate(
            avg_confidence=Avg('confidence_score')
        ).get('avg_confidence')
        average_confidence = _to_decimal(average_confidence, default=Decimal('0.75'))

        trust_score = Decimal('100')
        trust_score -= flagged_ratio * Decimal('55')
        trust_score -= high_risk_ratio * Decimal('25')
        trust_score -= (Decimal('1.0') - average_confidence) * Decimal('20')
        trust_score = max(Decimal('0'), min(Decimal('100'), trust_score))

        risk_level = TrustProfileService._risk_from_trust_score(trust_score)
        profile, _ = UserTrustProfile.objects.get_or_create(user=user)

        behavior_change_increment = 0
        if profile.last_event_type and profile.last_event_type != event_type:
            behavior_change_increment = 1

        profile.trust_score = trust_score.quantize(Decimal('0.01'))
        profile.risk_level = risk_level
        profile.total_transactions = total_transactions
        profile.flagged_transactions = flagged_transactions
        profile.high_risk_transactions = high_risk_transactions
        profile.flagged_ratio = flagged_ratio.quantize(Decimal('0.0001')) if total_transactions else Decimal('0.0000')
        profile.behavior_change_count = profile.behavior_change_count + behavior_change_increment
        profile.last_event_type = event_type
        profile.save(
            update_fields=[
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
        )
        return profile


class FraudFeedbackService:
    @staticmethod
    def capture_transaction_prediction(transaction: Transaction, score: FraudScoreResult) -> FraudFeedbackRecord:
        record, _ = FraudFeedbackRecord.objects.update_or_create(
            transaction=transaction,
            defaults={
                'user': transaction.user,
                'source': 'transaction',
                'predicted_label': score.prediction == 1,
                'predicted_probability': score.fraud_probability,
                'predicted_risk_level': score.risk_level,
            },
        )
        return record

    @staticmethod
    def capture_loan_prediction(loan_request) -> FraudFeedbackRecord:
        probability = _to_decimal(loan_request.ai_score, default=Decimal('0.0'))
        predicted_label = loan_request.ai_recommendation == LoanAIRecommendation.REJECT
        record, _ = FraudFeedbackRecord.objects.update_or_create(
            loan_request=loan_request,
            defaults={
                'user': loan_request.user,
                'source': 'loan',
                'predicted_label': predicted_label,
                'predicted_probability': probability,
                'predicted_risk_level': loan_request.ai_risk_level,
            },
        )
        return record

    @staticmethod
    def set_actual_outcome(record: FraudFeedbackRecord, actual_outcome: str, note: str = '') -> FraudFeedbackRecord:
        record.actual_outcome = actual_outcome
        if note is not None:
            record.note = note
        record.save(update_fields=['actual_outcome', 'note', 'updated_at'])
        return record


class NotificationEngine:
    @staticmethod
    def _create_notification(
        recipient_scope: str,
        category: str,
        title: str,
        message: str,
        recipient_user=None,
        related_transaction=None,
        related_loan_request=None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> SystemNotification:
        return SystemNotification.objects.create(
            recipient_scope=recipient_scope,
            recipient_user=recipient_user,
            category=category,
            title=title,
            message=message,
            related_transaction=related_transaction,
            related_loan_request=related_loan_request,
            metadata=metadata or {},
        )

    @staticmethod
    def notify_user(user, category: str, title: str, message: str, **kwargs) -> SystemNotification:
        return NotificationEngine._create_notification(
            recipient_scope=NotificationRecipientScope.USER,
            recipient_user=user,
            category=category,
            title=title,
            message=message,
            related_transaction=kwargs.get('related_transaction'),
            related_loan_request=kwargs.get('related_loan_request'),
            metadata=kwargs.get('metadata'),
        )

    @staticmethod
    def notify_admin(category: str, title: str, message: str, **kwargs) -> SystemNotification:
        return NotificationEngine._create_notification(
            recipient_scope=NotificationRecipientScope.ADMIN,
            recipient_user=None,
            category=category,
            title=title,
            message=message,
            related_transaction=kwargs.get('related_transaction'),
            related_loan_request=kwargs.get('related_loan_request'),
            metadata=kwargs.get('metadata'),
        )


class RiskMonitoringEngine:
    @staticmethod
    def _upsert_open_alert(
        user,
        pattern_key: str,
        alert_type: str,
        severity: str,
        details: Dict[str, Any],
        transaction: Optional[Transaction] = None,
    ) -> RiskAlert:
        alert = RiskAlert.objects.filter(
            user=user,
            pattern_key=pattern_key,
            status=RiskAlertStatus.OPEN,
        ).order_by('-detected_at').first()

        if alert:
            merged_details = dict(alert.details or {})
            merged_details.update(details or {})
            alert.alert_type = alert_type
            alert.severity = severity
            alert.details = merged_details
            if transaction is not None:
                alert.transaction = transaction
            alert.save(update_fields=['alert_type', 'severity', 'details', 'transaction', 'updated_at'])
            return alert

        return RiskAlert.objects.create(
            user=user,
            transaction=transaction,
            alert_type=alert_type,
            pattern_key=pattern_key,
            severity=severity,
            details=details or {},
            status=RiskAlertStatus.OPEN,
        )

    @staticmethod
    def analyze_transaction(transaction: Transaction, score: FraudScoreResult) -> list[RiskAlert]:
        user = transaction.user
        now = timezone.now()
        alerts: list[RiskAlert] = []

        flagged_last_24h = Transaction.objects.filter(
            user=user,
            status=TransactionStatus.FLAGGED,
            created_at__gte=now - timedelta(hours=24),
        ).count()
        if flagged_last_24h >= 3:
            alerts.append(
                RiskMonitoringEngine._upsert_open_alert(
                    user=user,
                    transaction=transaction,
                    pattern_key='repeated_fraud_attempts',
                    alert_type='Repeated fraud attempts',
                    severity=RiskAlertSeverity.HIGH,
                    details={'flagged_last_24h': flagged_last_24h},
                )
            )

        velocity_last_10m = Transaction.objects.filter(
            user=user,
            created_at__gte=now - timedelta(minutes=10),
        ).count()
        if velocity_last_10m >= 5:
            alerts.append(
                RiskMonitoringEngine._upsert_open_alert(
                    user=user,
                    transaction=transaction,
                    pattern_key='velocity_spike',
                    alert_type='Transaction velocity spike',
                    severity=RiskAlertSeverity.MEDIUM,
                    details={'transactions_last_10m': velocity_last_10m},
                )
            )

        repeated_amount_attempts = Transaction.objects.filter(
            user=user,
            amount=transaction.amount,
            created_at__gte=now - timedelta(hours=2),
        ).count()
        if repeated_amount_attempts >= 3:
            alerts.append(
                RiskMonitoringEngine._upsert_open_alert(
                    user=user,
                    transaction=transaction,
                    pattern_key='suspicious_pattern_cluster',
                    alert_type='Suspicious repeated pattern',
                    severity=RiskAlertSeverity.HIGH,
                    details={
                        'repeated_amount_attempts': repeated_amount_attempts,
                        'amount': float(transaction.amount),
                    },
                )
            )

        if score.prediction == 1 and score.flags:
            alerts.append(
                RiskMonitoringEngine._upsert_open_alert(
                    user=user,
                    transaction=transaction,
                    pattern_key='fraud_signal_cluster',
                    alert_type='Fraud signal cluster',
                    severity=RiskAlertSeverity.CRITICAL,
                    details={'flags': score.flags[:6]},
                )
            )

        return alerts


class BackgroundAutomationService:
    @staticmethod
    def handle_transaction_event(transaction: Transaction, score: FraudScoreResult) -> Dict[str, Any]:
        profile = TrustProfileService.update_user_profile(transaction.user, event_type='transaction_ingested')
        feedback = FraudFeedbackService.capture_transaction_prediction(transaction, score)
        alerts = RiskMonitoringEngine.analyze_transaction(transaction, score)

        notifications = []
        if transaction.status == TransactionStatus.FLAGGED:
            notifications.append(
                NotificationEngine.notify_user(
                    transaction.user,
                    NotificationCategory.FRAUD_ALERT,
                    'Fraud alert triggered',
                    'A recent transaction has been flagged for risk review.',
                    related_transaction=transaction,
                    metadata={'risk_level': score.risk_level, 'probability': float(score.fraud_probability)},
                ).id
            )
            notifications.append(
                NotificationEngine.notify_admin(
                    NotificationCategory.FRAUD_ALERT,
                    'Flagged transaction requires attention',
                    f'Transaction {transaction.id} for user {transaction.user.username} was flagged.',
                    related_transaction=transaction,
                    metadata={'risk_level': score.risk_level, 'flags': score.flags[:5]},
                ).id
            )

        return {
            'trust_profile_id': profile.id,
            'feedback_record_id': feedback.id,
            'risk_alert_ids': [alert.id for alert in alerts],
            'notification_ids': notifications,
        }

    @staticmethod
    def handle_loan_event(loan_request, event_type: str) -> Dict[str, Any]:
        profile = TrustProfileService.update_user_profile(loan_request.user, event_type=f'loan_{event_type}')
        feedback_record = None
        notification_ids = []

        if event_type == 'submitted':
            notification_ids.append(
                NotificationEngine.notify_user(
                    loan_request.user,
                    NotificationCategory.LOAN_UPDATE,
                    'Loan request submitted',
                    'Your loan request has been received and is awaiting evaluation.',
                    related_loan_request=loan_request,
                ).id
            )

        if event_type in {'evaluated', 'approved', 'rejected'}:
            feedback_record = FraudFeedbackService.capture_loan_prediction(loan_request)

        if event_type == 'evaluated':
            notification_ids.append(
                NotificationEngine.notify_user(
                    loan_request.user,
                    NotificationCategory.LOAN_UPDATE,
                    'Loan request evaluated',
                    f'Your loan request was evaluated with recommendation: {loan_request.ai_recommendation or "pending"}.',
                    related_loan_request=loan_request,
                ).id
            )

        if event_type in {'approved', 'rejected'}:
            decision_label = loan_request.status
            notification_ids.append(
                NotificationEngine.notify_user(
                    loan_request.user,
                    NotificationCategory.ADMIN_DECISION,
                    f'Loan request {decision_label}',
                    f'Your loan request has been {decision_label}.',
                    related_loan_request=loan_request,
                ).id
            )
            notification_ids.append(
                NotificationEngine.notify_admin(
                    NotificationCategory.ADMIN_DECISION,
                    f'Loan {decision_label}',
                    f'Loan request {loan_request.id} was {decision_label}.',
                    related_loan_request=loan_request,
                ).id
            )

        return {
            'trust_profile_id': profile.id,
            'feedback_record_id': getattr(feedback_record, 'id', None),
            'notification_ids': notification_ids,
        }