-- Gender
CREATE TYPE gender_type AS ENUM ('M', 'F', 'Other');

-- Transaction Status
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'flagged', 'reversed');

-- Risk Levels
CREATE TYPE risk_level_type AS ENUM ('Low', 'Medium', 'High');

-- Data Source
CREATE TYPE data_source_type AS ENUM ('sms', 'screenshot', 'pdf', 'manual');

-- Source Confidence
CREATE TYPE source_confidence AS ENUM ('low', 'medium', 'high');


CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    sex gender_type NOT NULL,
    age INT CHECK (age >= 16 AND age <= 100),
    signup_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE merchants (
    merchant_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    source_identifier VARCHAR(50) UNIQUE
);



CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    merchant_id INT REFERENCES merchants(merchant_id),
    amount DECIMAL(15,2) NOT NULL,
    status transaction_status DEFAULT 'pending',
    
    device_id VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    transaction_source VARCHAR(50),
    purchase_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Enhanced Fraud and Validation Fields
    data_source data_source_type DEFAULT 'manual',
    source_confidence source_confidence,
    parsing_success BOOLEAN DEFAULT TRUE,
    validation_score DECIMAL(5,4) DEFAULT 1.0,
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE validation_logs (
    log_id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    check_type VARCHAR(50),           -- e.g., 'timestamp', 'amount', 'repetition'
    check_passed BOOLEAN,
    message TEXT,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE confidence_scores (
    score_id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    confidence_level DECIMAL(5,4),    -- 0.0 to 1.0
    trust_level risk_level_type,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE fraud_assessments (
    assessment_id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    prediction INT,
    fraud_probability DECIMAL(5,4),
    risk_level risk_level_type,
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE transaction_trust (
    trust_id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    fraud_flag BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(5,4),
    risk_level risk_level_type,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE OR REPLACE VIEW v_model_input_features AS
WITH base_stats AS (
    SELECT 
        t.transaction_id,
        t.user_id,
        t.device_id,
        t.amount AS purchase_value,
        u.age,
        u.signup_time,
        t.purchase_time,
        t.ip_address,
        u.sex,
        t.data_source,
        t.source_confidence,
        t.validation_score,
        COUNT(*) OVER (PARTITION BY t.user_id ORDER BY t.purchase_time ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS user_transaction_count,
        COALESCE(AVG(t.amount) OVER (PARTITION BY t.user_id ORDER BY t.purchase_time ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), t.amount) AS user_avg_purchase
    FROM transactions t
    JOIN users u ON t.user_id = u.user_id
)
SELECT
    transaction_id,
    user_id,
    purchase_value,
    age,
    ip_address,
    data_source,
    source_confidence,
    validation_score,
    EXTRACT(EPOCH FROM (purchase_time - signup_time))/3600.0 AS time_since_signup,
    EXTRACT(HOUR FROM purchase_time) AS purchase_hour,
    EXTRACT(DOW FROM purchase_time) AS purchase_day_of_week,
    EXTRACT(MONTH FROM purchase_time) AS purchase_month,
    EXTRACT(DAY FROM purchase_time) AS purchase_day_of_month,
    CASE WHEN EXTRACT(DOW FROM purchase_time) IN (0, 6) THEN 1 ELSE 0 END AS is_weekend,
    user_transaction_count,
    user_avg_purchase,
    (purchase_value - user_avg_purchase) AS purchase_deviation
FROM base_stats;


CREATE INDEX idx_user_history ON transactions(user_id, purchase_time DESC);
CREATE INDEX idx_device_history ON transactions(device_id, purchase_time DESC);
CREATE INDEX idx_validation_logs ON validation_logs(transaction_id);
CREATE INDEX idx_confidence_scores ON confidence_scores(transaction_id);