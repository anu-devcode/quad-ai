"""
Preprocessor Module for Fraud Detection Project.

This module provides classes and functions to preprocess data for modeling.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from imblearn.over_sampling import SMOTE
from typing import Tuple, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Preprocessor:
    """Preprocess data for modeling."""
    
    def __init__(self):
        """Initialize the Preprocessor."""
        self.scaler = None
        self.preprocessing_log = []
    
    def scale_numerical_features(self, df: pd.DataFrame, 
                                 method: str = 'standard',
                                 columns: Optional[list] = None) -> pd.DataFrame:
        """
        Scale numerical features.
        
        Args:
            df: Input DataFrame
            method: Scaling method ('standard' or 'minmax')
            columns: List of columns to scale. If None, scales all numeric columns
            
        Returns:
            DataFrame with scaled features
        """
        df_scaled = df.copy()
        
        if columns is None:
            # Get all numeric columns except class/target
            columns = df_scaled.select_dtypes(include=[np.number]).columns.tolist()
            columns = [col for col in columns if col not in ['class', 'Class', 'user_id']]
        
        if method == 'standard':
            self.scaler = StandardScaler()
            df_scaled[columns] = self.scaler.fit_transform(df_scaled[columns])
            logger.info(f"Standard scaling applied to {len(columns)} features")
            self.preprocessing_log.append(f"StandardScaler applied to {len(columns)} columns")
        
        elif method == 'minmax':
            self.scaler = MinMaxScaler()
            df_scaled[columns] = self.scaler.fit_transform(df_scaled[columns])
            logger.info(f"MinMax scaling applied to {len(columns)} features")
            self.preprocessing_log.append(f"MinMaxScaler applied to {len(columns)} columns")
        
        return df_scaled
    
    def handle_class_imbalance(self, X: pd.DataFrame, y: pd.Series,
                               sampling_strategy: float = 1.0,
                               random_state: int = 42) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Apply SMOTE to handle class imbalance.
        
        Args:
            X: Feature DataFrame
            y: Target Series
            sampling_strategy: Ratio of minority to majority class (1.0 = balanced)
            random_state: Random seed for reproducibility
            
        Returns:
            Tuple of (resampled X, resampled y)
        """
        # Get class distribution before SMOTE
        class_dist_before = y.value_counts().to_dict()
        logger.info(f"Class distribution before SMOTE: {class_dist_before}")
        
        # Apply SMOTE
        smote = SMOTE(sampling_strategy=sampling_strategy, random_state=random_state)
        X_resampled, y_resampled = smote.fit_resample(X, y)
        
        # Get class distribution after SMOTE
        class_dist_after = pd.Series(y_resampled).value_counts().to_dict()
        logger.info(f"Class distribution after SMOTE: {class_dist_after}")
        
        self.preprocessing_log.append(
            f"SMOTE applied: {class_dist_before} -> {class_dist_after}"
        )
        
        return X_resampled, y_resampled
    
    def prepare_for_modeling(self, df: pd.DataFrame, 
                            target_col: str = 'class',
                            scale: bool = True,
                            handle_imbalance: bool = True) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Prepare data for modeling (scaling and imbalance handling).
        
        Args:
            df: Input DataFrame
            target_col: Name of the target column
            scale: Whether to scale features
            handle_imbalance: Whether to handle class imbalance
            
        Returns:
            Tuple of (X, y) ready for modeling
        """
        # Separate features and target
        X = df.drop([target_col], axis=1)
        y = df[target_col]
        
        # Drop non-numeric columns that shouldn't be in the model
        non_numeric_cols = X.select_dtypes(exclude=[np.number]).columns.tolist()
        if non_numeric_cols:
            logger.info(f"Dropping non-numeric columns: {non_numeric_cols}")
            X = X.select_dtypes(include=[np.number])
        
        # Scale if requested
        if scale:
            X = self.scale_numerical_features(X, method='standard')
        
        # Handle imbalance if requested
        if handle_imbalance:
            X, y = self.handle_class_imbalance(X, y)
        
        return X, y
    
    def get_preprocessing_report(self) -> str:
        """
        Get a report of all preprocessing operations.
        
        Returns:
            String containing the preprocessing log
        """
        if not self.preprocessing_log:
            return "No preprocessing operations performed yet."
        
        report = "Preprocessing Report\n"
        report += "=" * 50 + "\n"
        for i, log_entry in enumerate(self.preprocessing_log, 1):
            report += f"{i}. {log_entry}\n"
        
        return report
