-- Quirass AI Payment System Database Schema (Production-Grade Version)

-- 1. Enums and Extensions
CREATE TYPE gender_type AS ENUM ('M', 'F', 'Other');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'flagged', 'reversed');
CREATE TYPE risk_level_type AS ENUM ('Low', 'Medium', 'High');

-- 2. Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY, -- 'user_id' (unscaled)
    student_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    sex gender_type NOT NULL, -- 'sex'
    age INT CHECK (age >= 16 AND age <= 100), -- 'age'
    signup_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Merchants Table
CREATE TABLE merchants (
    merchant_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50), 
    source_identifier VARCHAR(50) UNIQUE -- Matches 'source'
);

-- 4. Transactions Table
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    merchant_id INT REFERENCES merchants(merchant_id),
    amount DECIMAL(15, 2) NOT NULL, -- 'purchase_value'
    status transaction_status DEFAULT 'pending',
    
    device_id VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL, -- Use INET for storage, cast to numeric in API
    user_agent TEXT, -- Parsed to 'browser' in API
    transaction_source VARCHAR(50),
    
    purchase_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Predictive Feature View 
-- This view produces EXACTLY the features defined in PredictionRequest (src/api.py)
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
        -- Cumulative counts EXCLUDING current transaction (using 1 PRECEDING)
        COUNT(*) OVER (PARTITION BY t.user_id ORDER BY t.purchase_time ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS user_transaction_count,
        COUNT(*) OVER (PARTITION BY t.device_id ORDER BY t.purchase_time ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS device_transaction_count,
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
    -- Time Since Signup (Hours)
    EXTRACT(EPOCH FROM (purchase_time - signup_time))/3600.0 AS time_since_signup,
    
    -- Precise Time Features for Model
    EXTRACT(HOUR FROM purchase_time) AS purchase_hour,
    EXTRACT(DOW FROM purchase_time) AS purchase_day_of_week,
    EXTRACT(MONTH FROM purchase_time) AS purchase_month,
    EXTRACT(DAY FROM purchase_time) AS purchase_day_of_month,
    CASE WHEN EXTRACT(DOW FROM purchase_time) IN (0, 6) THEN 1 ELSE 0 END AS is_weekend,
    
    -- Frequency & Monetary Features
    user_transaction_count,
    device_transaction_count,
    user_avg_purchase,
    (purchase_value - user_avg_purchase) AS purchase_deviation
FROM base_stats;

-- 6. Fraud Results Log
CREATE TABLE fraud_assessments (
    assessment_id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    prediction INT, 
    fraud_probability DECIMAL(5, 4),
    risk_level risk_level_type,
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimization Indexes
CREATE INDEX idx_user_history ON transactions(user_id, purchase_time DESC);
CREATE INDEX idx_device_history ON transactions(device_id, purchase_time DESC);
