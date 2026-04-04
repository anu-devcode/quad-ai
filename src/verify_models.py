import joblib
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
RF_PATH = MODELS_DIR / "random_forest.joblib"
SCALER_PATH = MODELS_DIR / "scaler.joblib"

def check():
    print("--- Model Verification ---")
    
    # Check Random Forest
    if RF_PATH.exists():
        rf = joblib.load(str(RF_PATH))
        print(f"✅ Random Forest loaded: {type(rf)}")
        print(f"   Number of estimators: {rf.n_estimators}")
        print(f"   Feature importances: {len(rf.feature_importances_)} features")
    else:
        print("❌ Random Forest NOT found.")

    # Check Scaler
    if SCALER_PATH.exists():
        scaler = joblib.load(str(SCALER_PATH))
        print(f"✅ Scaler loaded: {type(scaler)}")
        if hasattr(scaler, 'mean_'):
            print(f"   Scaled features count: {len(scaler.mean_)}")
    else:
        print("❌ Scaler NOT found.")

if __name__ == "__main__":
    check()
