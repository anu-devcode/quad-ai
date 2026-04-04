from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoanRequestViewSet, ModelMonitoringAPIView, PredictAPIView, ProjectVerificationAPIView, TransactionViewSet, UserGovernanceAPIView

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'loans/requests', LoanRequestViewSet, basename='loan-request')

urlpatterns = [
    path('predict/', PredictAPIView.as_view(), name='predict'),
    path('verification/report/', ProjectVerificationAPIView.as_view(), name='project-verification-report'),
    path('admin/users/', UserGovernanceAPIView.as_view(), name='admin-users'),
    path('admin/model-monitoring/', ModelMonitoringAPIView.as_view(), name='admin-model-monitoring'),
    path('', include(router.urls)),
]
