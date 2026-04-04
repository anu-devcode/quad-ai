"""
Train Script for Fraud Detection Project.

Orchestrates the full pipeline:
  1. Load data (Fraud_Data.csv + IpAddress_to_Country.csv)
  2. Clean data
  3. Feature engineering
  4. Preprocessing (scaling + SMOTE)
  5. Train Logistic Regression and Random Forest
  6. Evaluate and compare models
  7. Save trained models to disk
"""

import os
import sys
import logging
import joblib

# Allow running from either the repo root or the src/ directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT  = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, SCRIPT_DIR)

from data_loader      import DataLoader
from data_cleaner     import DataCleaner
from feature_engineer import FeatureEngineer
from preprocessor     import Preprocessor
from modeling         import ModelTrainer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── paths ──────────────────────────────────────────────────────────────────────
DATA_DIR   = os.path.join(REPO_ROOT, "data")
MODELS_DIR = os.path.join(REPO_ROOT, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

FRAUD_DATA_PATH = os.path.join(DATA_DIR, "Fraud_Data.csv")
IP_MAP_PATH     = os.path.join(DATA_DIR, "IpAddress_to_Country.csv")


def main():
    logger.info("=" * 60)
    logger.info("  FRAUD DETECTION — MODEL TRAINING PIPELINE")
    logger.info("=" * 60)

    # ── 1. Load data ───────────────────────────────────────────────────────────
    logger.info("\n[1/6] Loading data …")
    loader = DataLoader()
    df        = loader.load_fraud_data(FRAUD_DATA_PATH)
    ip_map_df = loader.load_ip_mapping(IP_MAP_PATH)

    summary = loader.get_data_summary()
    logger.info(f"  Fraud data  : {summary['fraud_data']['rows']:,} rows, "
                f"{summary['fraud_data']['columns']} cols")
    logger.info(f"  IP mapping  : {summary['ip_mapping']['rows']:,} rows")

    # ── 2. Clean data ──────────────────────────────────────────────────────────
    logger.info("\n[2/6] Cleaning data …")
    cleaner = DataCleaner()
    df = cleaner.remove_duplicates(df)
    df = cleaner.handle_missing_values(df, strategy='auto')
    df = cleaner.convert_data_types(df, datetime_cols=['signup_time', 'purchase_time'])
    df = cleaner.validate_ranges(df, {'age': (0, 120), 'purchase_value': (0, 1_000_000)})
    logger.info(cleaner.get_cleaning_report())

    # ── 3. Feature engineering ─────────────────────────────────────────────────
    logger.info("\n[3/6] Engineering features …")
    engineer = FeatureEngineer()
    df = engineer.create_time_features(df)
    df = engineer.map_ip_to_country(df, ip_map_df, inplace=True)
    df = engineer.create_frequency_features(df)
    df = engineer.encode_categorical_features(df, encoding_type='onehot')
    logger.info(engineer.get_feature_report())

    # ── 4. Preprocessing ───────────────────────────────────────────────────────
    logger.info("\n[4/6] Preprocessing (scaling + SMOTE) …")
    preprocessor = Preprocessor()
    X, y = preprocessor.prepare_for_modeling(df, target_col='class',
                                             scale=True, handle_imbalance=True)

    X_train, X_test, y_train, y_test = preprocessor.stratified_split(
        X, y, test_size=0.2, random_state=42
    )
    logger.info(f"  Train samples : {len(X_train):,}  |  Test samples : {len(X_test):,}")
    logger.info(preprocessor.get_preprocessing_report())

    # ── 5. Train models ────────────────────────────────────────────────────────
    logger.info("\n[5/6] Training models …")
    trainer = ModelTrainer(random_state=42)

    # Baseline: Logistic Regression
    lr_model = trainer.train_baseline_logistic_regression(X_train, y_train)
    trainer.evaluate_model(lr_model, X_test, y_test, model_name='logistic_regression')

    # Ensemble: Random Forest (no tuning for speed; set tune=True for grid search)
    rf_model = trainer.train_ensemble_random_forest(
        X_train, y_train,
        tune=False,          # flip to True to enable RandomizedSearchCV
        n_estimators=100,
        n_jobs=1,
    )
    trainer.evaluate_model(rf_model, X_test, y_test, model_name='random_forest')

    # ── 6. Compare & persist ───────────────────────────────────────────────────
    logger.info("\n[6/6] Comparing models & saving artifacts …")
    comparison_df = trainer.compare_models()
    logger.info("\n" + comparison_df.to_string())

    # Save models
    lr_path = os.path.join(MODELS_DIR, "logistic_regression.joblib")
    rf_path = os.path.join(MODELS_DIR, "random_forest.joblib")
    sc_path = os.path.join(MODELS_DIR, "scaler.joblib")

    joblib.dump(lr_model, lr_path)
    joblib.dump(rf_model, rf_path)
    joblib.dump(preprocessor.scaler, sc_path)

    logger.info(f"  Logistic Regression → {lr_path}")
    logger.info(f"  Random Forest       → {rf_path}")
    logger.info(f"  Scaler              → {sc_path}")
    logger.info("\n✅  Training pipeline completed successfully.")


if __name__ == "__main__":
    main()
