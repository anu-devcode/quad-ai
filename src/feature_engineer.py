"""
Feature Engineer Module for Fraud Detection Project.

This module provides classes and functions to create engineered features.
"""

import pandas as pd
import numpy as np
from typing import Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FeatureEngineer:
    """Engineer features for fraud detection."""
    
    def __init__(self):
        """Initialize the FeatureEngineer."""
        self.feature_log = []
    
    def create_time_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create time-based features from signup_time and purchase_time.
        
        Args:
            df: Input DataFrame with signup_time and purchase_time columns
            
        Returns:
            DataFrame with additional time-based features
        """
        df_feat = df.copy()
        
        # Ensure datetime format
        if df_feat['signup_time'].dtype != 'datetime64[ns]':
            df_feat['signup_time'] = pd.to_datetime(df_feat['signup_time'])
        if df_feat['purchase_time'].dtype != 'datetime64[ns]':
            df_feat['purchase_time'] = pd.to_datetime(df_feat['purchase_time'])
        
        # Time since signup (in hours)
        df_feat['time_since_signup'] = (
            df_feat['purchase_time'] - df_feat['signup_time']
        ).dt.total_seconds() / 3600
        
        # Purchase time features
        df_feat['purchase_hour'] = df_feat['purchase_time'].dt.hour
        df_feat['purchase_day_of_week'] = df_feat['purchase_time'].dt.dayofweek
        df_feat['purchase_month'] = df_feat['purchase_time'].dt.month
        df_feat['purchase_day_of_month'] = df_feat['purchase_time'].dt.day
        
        # Is weekend
        df_feat['is_weekend'] = (df_feat['purchase_day_of_week'] >= 5).astype(int)
        
        # Time of day categories
        df_feat['time_of_day'] = pd.cut(
            df_feat['purchase_hour'],
            bins=[0, 6, 12, 18, 24],
            labels=['Night', 'Morning', 'Afternoon', 'Evening'],
            include_lowest=True
        )
        
        logger.info(\"Created time-based features: time_since_signup, purchase_hour, purchase_day_of_week, etc.\")\n        self.feature_log.append(\"Created 7 time-based features\")\n        \n        return df_feat
    
    def map_ip_to_country(self, df: pd.DataFrame, ip_mapping: pd.DataFrame) -> pd.DataFrame:
        """
        Map IP addresses to countries using the IP mapping table.
        
        Args:
            df: DataFrame with ip_address column
            ip_mapping: DataFrame with IP to country mappings
            
        Returns:
            DataFrame with country column added
        """
        df_feat = df.copy()
        \n        # Initialize country column\n        df_feat['country'] = 'Unknown'\n        \n        logger.info(f\"Mapping {len(df_feat)} IP addresses to countries...\")\n        \n        # For performance, we'll use a vectorized approach\n        # This is a simplified version - in production, you'd want more sophisticated matching\n        for idx, row in df_feat.iterrows():\n            ip_val = row['ip_address']\n            # Find matching country\n            mask = (ip_mapping['lower_bound_ip_address'] <= ip_val) & \\\n                   (ip_mapping['upper_bound_ip_address'] >= ip_val)\n            match = ip_mapping[mask]\n            if len(match) > 0:\n                df_feat.at[idx, 'country'] = match.iloc[0]['country']\n        \n        logger.info(f\"Mapped IP addresses. Found {(df_feat['country'] != 'Unknown').sum()} matches\")\n        self.feature_log.append(\"Mapped IP addresses to countries\")\n        \n        return df_feat
    
    def create_frequency_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create transaction frequency features.
        
        Args:
            df: Input DataFrame with user_id and device_id columns
            
        Returns:
            DataFrame with frequency features
        """
        df_feat = df.copy()
        
        # User transaction count
        user_counts = df_feat['user_id'].value_counts()\n        df_feat['user_transaction_count'] = df_feat['user_id'].map(user_counts)
        
        # Device transaction count
        device_counts = df_feat['device_id'].value_counts()
        df_feat['device_transaction_count'] = df_feat['device_id'].map(device_counts)
        
        # Purchase value per user (average)
        user_avg_purchase = df_feat.groupby('user_id')['purchase_value'].mean()
        df_feat['user_avg_purchase'] = df_feat['user_id'].map(user_avg_purchase)
        
        # Deviation from user's average purchase
        df_feat['purchase_deviation'] = df_feat['purchase_value'] - df_feat['user_avg_purchase']
        
        logger.info(\"Created frequency features: user_transaction_count, device_transaction_count, etc.\")\n        self.feature_log.append(\"Created 4 frequency features\")\n        \n        return df_feat
    
    def encode_categorical_features(self, df: pd.DataFrame, 
                                    encoding_type: str = 'onehot') -> pd.DataFrame:
        """
        Encode categorical variables.
        
        Args:
            df: Input DataFrame
            encoding_type: Type of encoding ('onehot', 'label')
            
        Returns:
            DataFrame with encoded categorical features
        """
        df_feat = df.copy()
        
        categorical_cols = ['source', 'browser', 'sex']\n        \n        if encoding_type == 'onehot':
            # One-hot encoding
            df_feat = pd.get_dummies(df_feat, columns=categorical_cols, \n                                     prefix=categorical_cols, drop_first=True)\n            logger.info(f\"One-hot encoded {len(categorical_cols)} categorical features\")\n            self.feature_log.append(f\"One-hot encoded: {', '.join(categorical_cols)}\")\n        \n        elif encoding_type == 'label':\n            # Label encoding\n            from sklearn.preprocessing import LabelEncoder\n            \n            for col in categorical_cols:\n                if col in df_feat.columns:\n                    le = LabelEncoder()\n                    df_feat[col + '_encoded'] = le.fit_transform(df_feat[col].astype(str))\n            \n            logger.info(f\"Label encoded {len(categorical_cols)} categorical features\")\n            self.feature_log.append(f\"Label encoded: {', '.join(categorical_cols)}\")\n        \n        return df_feat
    
    def get_feature_report(self) -> str:
        """
        Get a report of all feature engineering operations.
        
        Returns:
            String containing the feature engineering log
        """
        if not self.feature_log:
            return \"No feature engineering operations performed yet.\"
        
        report = \"Feature Engineering Report\\n\"
        report += \"=\" * 50 + \"\\n\"
        for i, log_entry in enumerate(self.feature_log, 1):
            report += f\"{i}. {log_entry}\\n\"
        
        return report
