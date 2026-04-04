from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
import joblib
import pandas as pd
import numpy as np
import os
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Fraud Detection API", version="1.0.0")

# --- Constants & Paths ---
MODELS_DIR = "models"
MODEL_PATH = os.path.join(MODELS_DIR, "random_forest.joblib")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.joblib")

# --- Global State for Models ---
model = None
scaler = None

# Thresholds for risk levels
LOW_RISK_THRESHOLD = 0.2
HIGH_RISK_THRESHOLD = 0.7

# --- Schemas ---

class PredictionRequest(BaseModel):
    user_id: int
    signup_time: str = Field(..., description="ISO 8601 format: YYYY-MM-DD HH:MM:SS")
    purchase_time: str = Field(..., description="ISO 8601 format: YYYY-MM-DD HH:MM:SS")
    purchase_value: float
    device_id: str
    source: str
    browser: str
    sex: str
    age: int
    ip_address: float
    # Optional context (normally from a DB, but allowing input for this demo)
    user_transaction_count: Optional[int] = 1
    device_transaction_count: Optional[int] = 1
    user_avg_purchase: Optional[float] = None

class PredictionOutput(BaseModel):
    prediction: int
    fraud_probability: float
    legitimate_probability: float
    risk_level: str

def load_assets():
    global model, scaler
    try:
        logger.info(f"Loading model from {MODEL_PATH}...")
        model = joblib.load(MODEL_PATH)
        logger.info(f"Loading scaler from {SCALER_PATH}...")
        scaler = joblib.load(SCALER_PATH)
        logger.info("All assets loaded successfully.")
    except Exception as e:
        logger.error(f"CRITICAL: Failed to load assets: {e}")
        # Not raising here but in endpoint if called

# Pre-load assets instead of relying only on startup events
load_assets()

# --- Helper Logic ---

def preprocess_request(req: PredictionRequest) -> np.ndarray:
    """
    Transforms the Pydantic request into the 13-feature vector 
    expected by the Random Forest model.
    """
    # 1. Parse times
    signup_dt = datetime.strptime(req.signup_time, "%Y-%m-%d %H:%M:%S")
    purchase_dt = datetime.strptime(req.purchase_time, "%Y-%m-%d %H:%M:%S")
    
    # 2. Time-based features
    time_since_signup = (purchase_dt - signup_dt).total_seconds() / 3600.0
    purchase_hour = purchase_dt.hour
    purchase_day_of_week = purchase_dt.weekday() # 0=Mon, 6=Sun
    purchase_month = purchase_dt.month
    purchase_day_of_month = purchase_dt.day
    is_weekend = 1 if purchase_day_of_week >= 5 else 0
    
    # 3. Frequency & Monetary Features
    user_tx_count = req.user_transaction_count
    device_tx_count = req.device_transaction_count
    user_avg_p = req.user_avg_purchase if req.user_avg_purchase is not None else req.purchase_value
    purchase_dev = req.purchase_value - user_avg_p
    
    # 4. Construct feature dict (matching the 14 training features)
    features = {
        'purchase_value': req.purchase_value,
        'age': req.age,
        'ip_address': req.ip_address,
        'time_since_signup': time_since_signup,
        'purchase_hour': purchase_hour,
        'purchase_day_of_week': purchase_day_of_week,
        'purchase_month': purchase_month,
        'purchase_day_of_month': purchase_day_of_month,
        'is_weekend': is_weekend,
        'user_id': req.user_id,
        'user_transaction_count': user_tx_count,
        'device_transaction_count': device_tx_count,
        'user_avg_purchase': user_avg_p,
        'purchase_deviation': purchase_dev
    }
    
    # Ensure order matches training columns (must be exactly this order)
    feature_order = [
        'purchase_value', 'age', 'ip_address', 'time_since_signup', 
        'purchase_hour', 'purchase_day_of_week', 'purchase_month', 
        'purchase_day_of_month', 'is_weekend', 'user_id',
        'user_transaction_count', 'device_transaction_count', 
        'user_avg_purchase', 'purchase_deviation'
    ]
    
    feature_values = [features[col] for col in feature_order]
    
    # 5. Scale only the 13 features that were scaled during training
    # The scaler expects these 13 in this specific order
    scaler_feature_order = [
        'purchase_value', 'age', 'ip_address', 'time_since_signup', 
        'purchase_hour', 'purchase_day_of_week', 'purchase_month', 
        'purchase_day_of_month', 'is_weekend',
        'user_transaction_count', 'device_transaction_count', 
        'user_avg_purchase', 'purchase_deviation'
    ]
    
    scaler_values = [features[col] for col in scaler_feature_order]
    X_to_scale = np.array(scaler_values).reshape(1, -1)
    X_scaled_parts = scaler.transform(X_to_scale)[0]
    
    # 6. Reconstruct the 14-feature vector for the model
    # Model expects: [scaled 0-8] + [unscaled user_id] + [scaled 9-12]
    X_final = np.concatenate([
        X_scaled_parts[:9],           # purchase_value to is_weekend (scaled)
        [float(req.user_id)],         # user_id (unscaled)
        X_scaled_parts[9:]            # user_transaction_count to purchase_deviation (scaled)
    ]).reshape(1, -1)
    
    return X_final

def get_risk_level(fraud_prob: float) -> str:
    if fraud_prob < LOW_RISK_THRESHOLD:
        return "Low"
    elif fraud_prob < HIGH_RISK_THRESHOLD:
        return "Medium"
    else:
        return "High"

# --- Endpoints ---

@app.get("/")
async def root():
    return {"status": "online", "model": "Random Forest Fraud Detector"}

@app.post("/predict", response_model=PredictionOutput)
async def predict(request: PredictionRequest):
    try:
        # Preprocess
        X_processed = preprocess_request(request)
        
        # Predict Probabilities
        probs = model.predict_proba(X_processed)[0] # [legit, fraud]
        legit_prob = float(probs[0])
        fraud_prob = float(probs[1])
        
        # Binary prediction (0 or 1)
        pred = int(model.predict(X_processed)[0])
        
        # Risk level
        risk_level = get_risk_level(fraud_prob)
        
        return PredictionOutput(
            prediction=pred,
            fraud_probability=fraud_prob,
            legitimate_probability=legit_prob,
            risk_level=risk_level
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
