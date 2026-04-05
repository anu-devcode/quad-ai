from decimal import Decimal
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import OTPPurpose, OTPVerificationCode, Transaction
from .ocr_service import OCRService


SMS_MOCK_TEXT = (
	"CBE ALERT: Purchase value: 3250.75 ETB on 2026-04-05 10:30:00. "
	"Payment sent to MERCHANT-001. user_id=111 device_id=sms-device-01 ip_address=127.0.0.1"
)


class SMSParsingTests(APITestCase):
	def test_parse_transaction_data_from_sms_mock(self):
		parsed = OCRService.parse_transaction_data(SMS_MOCK_TEXT)

		self.assertEqual(parsed['amount'], Decimal('3250.75'))
		self.assertIsNotNone(parsed['purchase_time'])
		self.assertTrue(parsed['parsing_success'])
		self.assertGreaterEqual(float(parsed['validation_score']), 0.7)


class SMSIngestionEvaluationTests(APITestCase):
	def test_ingest_sms_parses_and_scores_transaction(self):
		payload = {
			'source_type': 'sms',
			'raw_text': SMS_MOCK_TEXT,
			'device_id': 'sms-ingest-device-01',
			'ip_address': '127.0.0.1',
			'external_user_key': '+251911123456',
			'owner_name': 'SMS Mock User',
			'age': 29,
		}

		response = self.client.post('/api/transactions/ingest/', data=payload, format='json')
		self.assertEqual(response.status_code, 201)

		body = response.json()
		self.assertEqual(body.get('data_source'), 'sms')
		self.assertIsNotNone(body.get('id'))
		self.assertIn('fraud_assessment', body)
		self.assertIn('prediction', body['fraud_assessment'])
		self.assertIn('fraud_probability', body['fraud_assessment'])
		self.assertIn('risk_level', body['fraud_assessment'])

		txn = Transaction.objects.get(id=body['id'])
		self.assertEqual(txn.data_source, 'sms')
		self.assertIsNotNone(txn.purchase_time)

		User = get_user_model()
		created_user = User.objects.filter(phone_number='+251911123456').first()
		self.assertIsNotNone(created_user)

	def test_upload_sms_supports_type_alias_and_returns_evaluation_shape(self):
		payload = {
			'type': 'sms',
			'raw_text': SMS_MOCK_TEXT,
			'device_id': 'sms-upload-device-01',
			'ip_address': '127.0.0.1',
			'external_user_key': '+251911654321',
			'owner_name': 'SMS Upload User',
			'age': 31,
		}

		response = self.client.post('/api/transactions/upload/', data=payload, format='json')
		self.assertEqual(response.status_code, 201)

		body = response.json()
		self.assertIn('parsed_data', body)
		self.assertIn('fraud_score', body)
		self.assertIn('risk_level', body)
		self.assertIn('raw_result', body)
		self.assertEqual(body['parsed_data'].get('source'), 'sms')


class OTPLoginFlowTests(APITestCase):
	def test_existing_profile_user_can_sign_in_without_onboarding(self):
		phone_number = '+251911100001'
		User = get_user_model()

		User.objects.create(
			username='portal_251911100001',
			student_id='PTL-251911100001',
			sex='Other',
			age=27,
			first_name='Existing',
			last_name='Member',
			phone_number=phone_number,
			city_region='Addis Ababa',
			financial_institutions=['Commercial Bank of Ethiopia'],
			is_active=True,
		)

		OTPVerificationCode.objects.create(
			phone_number=phone_number,
			otp_code='123456',
			purpose=OTPPurpose.USER,
			expires_at=timezone.now() + timedelta(minutes=10),
		)

		response = self.client.post(
			'/api/auth/otp/verify/',
			data={
				'phone_number': phone_number,
				'otp_code': '123456',
				'purpose': 'user',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 200)
		body = response.json()
		self.assertTrue(body.get('verified'))
		self.assertTrue(body.get('existing_user'))
		self.assertTrue(body.get('profile_complete'))
		self.assertFalse(body.get('onboarding_required'))
