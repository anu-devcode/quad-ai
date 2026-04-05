# Database Tables Report (Non-Technical)

Date: 2026-04-05
Audience: Business and operations teams

This report explains what each main database table is for and what each field stores, in plain language.

## 1) Users
Purpose: Stores each person account (customer and admin) and account status.

| Field | What it stores |
|---|---|
| id | Internal account number. |
| username | Login name used by the system. |
| password | Encrypted password (not plain text). |
| first_name | Person first name. |
| last_name | Person last name. |
| email | Contact email. |
| student_id | Unique external ID for the person. |
| sex | Gender marker (M, F, Other). |
| age | Age value, if provided. |
| signup_time | When the account was first created. |
| is_active | Whether the account can be used. |
| is_staff | Whether the account can access admin tools. |
| is_superuser | Whether the account has full system privileges. |
| last_login | Most recent successful login time. |
| date_joined | Original join date. |
| groups | Permission groups linked to this user. |
| user_permissions | Direct permissions linked to this user. |

## 2) Merchants
Purpose: Stores merchant or business information used in transactions.

| Field | What it stores |
|---|---|
| id | Internal merchant number. |
| name | Merchant name. |
| category | Merchant type (for example retail, utility). |
| source_identifier | Unique source code from upstream systems, if any. |

## 3) Transactions
Purpose: Stores each payment or purchase event and ingestion quality data.

| Field | What it stores |
|---|---|
| id | Internal transaction number. |
| user | Which user made the transaction. |
| merchant | Which merchant received the transaction (optional). |
| amount | Transaction amount. |
| status | Processing state (pending, completed, failed, flagged, reversed). |
| device_id | Device identifier used during the transaction. |
| ip_address | Network address used during the transaction. |
| user_agent | Device/browser fingerprint text (optional). |
| transaction_source | Source label from the originating channel (optional). |
| purchase_time | Event time of purchase. |
| created_at | Time this row was stored in the database. |
| data_source | Input type used (sms, screenshot, pdf, manual). |
| source_confidence | System confidence in the input source quality (low, medium, high). |
| parsing_success | Whether extraction/parsing succeeded. |
| validation_score | Numeric quality score from validation checks. |
| extracted_at | Time extraction metadata was recorded. |

## 4) Validation Logs
Purpose: Stores check-by-check validation notes for each transaction.

| Field | What it stores |
|---|---|
| id | Internal validation log number. |
| transaction | Transaction this log belongs to. |
| check_type | Check name (for example timestamp check). |
| check_passed | Whether the check passed. |
| message | Human-readable note about the check result. |
| checked_at | Time the check was recorded. |

## 5) Confidence Scores
Purpose: Stores confidence scoring output for a transaction.

| Field | What it stores |
|---|---|
| id | Internal confidence record number. |
| transaction | Transaction linked to this confidence score. |
| confidence_level | Numeric confidence level (0.0 to 1.0). |
| trust_level | Classified trust/risk band (Low, Medium, High). |
| computed_at | Time this confidence score was calculated. |

## 6) Fraud Assessments
Purpose: Stores fraud model prediction results.

| Field | What it stores |
|---|---|
| id | Internal fraud assessment number. |
| transaction | Transaction that was assessed. |
| prediction | Model flag (0 = not fraud, 1 = potential fraud). |
| fraud_probability | Probability score from the fraud model. |
| risk_level | Risk class (Low, Medium, High). |
| assessed_at | Time of model assessment. |

## 7) Transaction Trust
Purpose: Stores trust-focused output used for risk and confidence views.

| Field | What it stores |
|---|---|
| id | Internal trust record number. |
| transaction | Transaction linked to trust metrics. |
| fraud_flag | Quick flag indicating suspicious activity. |
| confidence_score | Numeric confidence/trust score. |
| risk_level | Risk class (Low, Medium, High). |
| computed_at | Time trust metrics were calculated. |

## 8) Loan Requests
Purpose: Stores customer loan applications and AI/admin decisions.

| Field | What it stores |
|---|---|
| id | Internal loan request number. |
| user | Person who requested the loan. |
| requested_amount | Amount requested. |
| requested_tenure_months | Repayment duration in months. |
| stated_income | Applicant reported income. |
| purpose | Applicant reason for the loan (optional). |
| status | Workflow state (submitted, evaluating, evaluated, approved, rejected). |
| ai_recommendation | AI recommendation (approve/reject), if available. |
| ai_risk_level | AI risk class for this loan. |
| ai_score | AI numeric risk score. |
| decision_reasoning | Short explanation text from scoring logic. |
| admin_decision_note | Human reviewer note. |
| decided_by | Admin user who made final decision (if decided). |
| decided_at | Time final decision was made. |
| evaluated_at | Time AI evaluation finished. |
| created_at | Time request was created. |
| updated_at | Last update time. |

## 9) Model Input Features (View)
Purpose: A read-only analytics view used to prepare machine-learning features.
Note: This is a view, not a normal table. It is derived from transaction and user data.

| Field | What it stores |
|---|---|
| transaction | Transaction linked to this feature row. |
| user | User linked to this feature row. |
| purchase_value | Transaction amount used by the model. |
| age | User age used by the model. |
| ip_address | IP address used in feature prep. |
| data_source | Input channel (sms, screenshot, pdf, manual). |
| source_confidence | Source quality level. |
| validation_score | Validation quality score. |
| time_since_signup | Time between signup and purchase, in hours. |
| purchase_hour | Hour of day of transaction. |
| purchase_day_of_week | Day of week number. |
| purchase_month | Month number. |
| purchase_day_of_month | Day number in month. |
| is_weekend | Weekend indicator (true/false). |
| user_transaction_count | User historical transaction count. |
| user_avg_purchase | User average transaction amount. |
| purchase_deviation | Difference from user average amount. |

## Quick Summary
- Core business records: Users, Merchants, Transactions, Loan Requests.
- Risk and AI records: Validation Logs, Confidence Scores, Fraud Assessments, Transaction Trust.
- Analytics layer: Model Input Features view for machine-learning inputs.
