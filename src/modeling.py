"""
Modeling Module for Fraud Detection Project.

This module provides classes and functions to train, evaluate, and tune machine learning models.
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, Any, Tuple, Optional
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    precision_recall_curve, auc, f1_score, confusion_matrix, 
    classification_report, accuracy_score, precision_score, recall_score
)
import matplotlib.pyplot as plt
import seaborn as sns

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelTrainer:
    """Train and evaluate models for fraud detection."""
    
    def __init__(self, random_state: int = 42):
        """Initialize the ModelTrainer."""
        self.random_state = random_state
        self.models = {}
        self.results = {}
    
    def calculate_auc_pr(self, y_true: np.ndarray, y_probs: np.ndarray) -> float:
        """Calculate Area Under the Precision-Recall Curve."""
        precision, recall, _ = precision_recall_curve(y_true, y_probs)
        return auc(recall, precision)
    
    def evaluate_model(self, model: Any, X_test: pd.DataFrame, y_test: pd.Series, 
                       model_name: str) -> Dict[str, Any]:
        """
        Evaluate a model and return metrics.
        
        Args:
            model: Trained model
            X_test: Test features
            y_test: Test target
            model_name: Name of the model for logging
            
        Returns:
            Dictionary of metrics
        """
        y_pred = model.predict(X_test)
        
        # Check if the model has predict_proba
        if hasattr(model, "predict_proba"):
            y_probs = model.predict_proba(X_test)[:, 1]
            auc_pr = self.calculate_auc_pr(y_test, y_probs)
        else:
            auc_pr = None
            
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred),
            'recall': recall_score(y_test, y_pred),
            'f1_score': f1_score(y_test, y_pred),
            'auc_pr': auc_pr,
            'confusion_matrix': confusion_matrix(y_test, y_pred)
        }
        
        logger.info(f"Evaluation for {model_name}:")
        logger.info(f"  F1-Score: {metrics['f1_score']:.4f}")
        if auc_pr is not None:
            logger.info(f"  AUC-PR: {metrics['auc_pr']:.4f}")
            
        self.results[model_name] = metrics
        return metrics

    def train_baseline_logistic_regression(self, X_train: pd.DataFrame, y_train: pd.Series, 
                                           **kwargs) -> LogisticRegression:
        """Train a baseline Logistic Regression model."""
        logger.info("Training baseline Logistic Regression model...")
        model = LogisticRegression(random_state=self.random_state, max_iter=1000, **kwargs)
        model.fit(X_train, y_train)
        self.models['logistic_regression'] = model
        return model

    def plot_confusion_matrix(self, model_name: str):
        """Plot confusion matrix for a given model."""
        if model_name not in self.results:
            logger.error(f"No results found for {model_name}. Run evaluate_model first.")
            return
            
        cm = self.results[model_name]['confusion_matrix']
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
        plt.title(f'Confusion Matrix - {model_name}')
        plt.ylabel('True label')
        plt.xlabel('Predicted label')
        plt.show()

    def compare_models(self) -> pd.DataFrame:
        """Compare all evaluated models in a DataFrame."""
        comparison = {}
        for name, metrics in self.results.items():
            comparison[name] = {
                'Accuracy': metrics['accuracy'],
                'Precision': metrics['precision'],
                'Recall': metrics['recall'],
                'F1-Score': metrics['f1_score'],
                'AUC-PR': metrics['auc_pr']
            }
        return pd.DataFrame(comparison).T
