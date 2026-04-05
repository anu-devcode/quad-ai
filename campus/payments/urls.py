from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HealthAPIView,
    FraudFeedbackViewSet,
    LoanRequestViewSet,
    ModelMonitoringAPIView,
    NotificationViewSet,
    OTPRequestAPIView,
    OTPVerifyAPIView,
    PredictAPIView,
    ProjectVerificationAPIView,
    RiskAlertViewSet,
    TransactionViewSet,
    UserGovernanceAPIView,
    UserTrustProfileViewSet,
)

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'loans/requests', LoanRequestViewSet, basename='loan-request')
router.register(r'trust/profiles', UserTrustProfileViewSet, basename='trust-profile')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'risk/alerts', RiskAlertViewSet, basename='risk-alert')
router.register(r'fraud/feedback', FraudFeedbackViewSet, basename='fraud-feedback')

urlpatterns = [
    path('health/', HealthAPIView.as_view(), name='health'),
    path('auth/otp/request/', OTPRequestAPIView.as_view(), name='otp-request'),
    path('auth/otp/verify/', OTPVerifyAPIView.as_view(), name='otp-verify'),
    path('predict/', PredictAPIView.as_view(), name='predict'),
    path('verification/report/', ProjectVerificationAPIView.as_view(), name='project-verification-report'),
    path('admin/users/', UserGovernanceAPIView.as_view(), name='admin-users'),
    path('admin/model-monitoring/', ModelMonitoringAPIView.as_view(), name='admin-model-monitoring'),
    path('', include(router.urls)),
]
