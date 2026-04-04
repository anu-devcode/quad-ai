import joblib
import os
import sys

# Paths
MODELS_DIR = "models"
LR_PATH = os.path.join(MODELS_DIR, "logistic_regression.joblib")
RF_PATH = os.path.join(MODELS_DIR, "random_forest.joblib")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.joblib")

def check():
    print("--- Model Verification ---")
    
    # Check Logistic Regression
    if os.path.exists(LR_PATH):
        lr = joblib.load(LR_PATH)
        print(f"✅ Logistic Regression loaded: {type(lr)}")
        print(f"   Coefficients shape: {lr.coef_.shape}")
    else:
        print("❌ Logistic Regression NOT found.")

    # Check Random Forest
    if os.path.exists(RF_PATH):
        rf = joblib.load(RF_PATH)
        print(f"✅ Random Forest loaded: {type(rf)}")
        print(f"   Number of estimators: {rf.n_estimators}")
        print(f"   Feature importances: {len(rf.feature_importances_)} features")
    else:
        print("❌ Random Forest NOT found.")

    # Check Scaler
    if os.path.exists(SCALER_PATH):
        scaler = joblib.load(SCALER_PATH)
        print(f"✅ Scaler loaded: {type(scaler)}")
        if hasattr(scaler, 'mean_'):
            print(f"   Scaled features count: {len(scaler.mean_)}")
    else:
        print("❌ Scaler NOT found.")

if __name__ == "__main__":
    check()
