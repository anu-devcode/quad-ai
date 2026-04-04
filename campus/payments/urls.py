from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoanRequestViewSet, PredictAPIView, ProjectVerificationAPIView, TransactionViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'loans/requests', LoanRequestViewSet, basename='loan-request')

urlpatterns = [
    path('predict/', PredictAPIView.as_view(), name='predict'),
    path('verification/report/', ProjectVerificationAPIView.as_view(), name='project-verification-report'),
    path('', include(router.urls)),
]
