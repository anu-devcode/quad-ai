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
        
        logger.info("Created time-based features: time_since_signup, purchase_hour, purchase_day_of_week, etc.")
        self.feature_log.append("Created 7 time-based features")
        
        return df_feat
    
    _ip_mapping_cache = None  # Class-level cache for sorted IP mapping
    
    def map_ip_to_country(self, df: pd.DataFrame, ip_mapping: pd.DataFrame, 
                          inplace: bool = False) -> pd.DataFrame:
        """
        Map IP addresses to countries using vectorized binary search.
        
        Uses np.searchsorted for O(n log m) performance instead of O(n * m).
        Caches the sorted IP mapping to avoid re-sorting on subsequent calls.
        
        Args:
            df: DataFrame with ip_address column
            ip_mapping: DataFrame with lower_bound_ip_address, upper_bound_ip_address, country
            inplace: If True, modify df directly instead of creating a copy (faster)
            
        Returns:
            DataFrame with country column added
        """
        df_feat = df if inplace else df.copy()
        
        logger.info(f"Mapping {len(df_feat)} IP addresses to countries...")
        
        # Cache the sorted IP mapping and extracted arrays
        # Use id() of the DataFrame to detect if a new mapping was provided
        cache_key = id(ip_mapping)
        if (FeatureEngineer._ip_mapping_cache is None or 
            FeatureEngineer._ip_mapping_cache.get('key') != cache_key):
            
            ip_sorted = ip_mapping.sort_values('lower_bound_ip_address')
            FeatureEngineer._ip_mapping_cache = {
                'key': cache_key,
                'lower_bounds': ip_sorted['lower_bound_ip_address'].values,
                'upper_bounds': ip_sorted['upper_bound_ip_address'].values,
                'countries': ip_sorted['country'].values
            }
            logger.info("IP mapping cache created")
        
        # Extract cached arrays
        cache = FeatureEngineer._ip_mapping_cache
        lower_bounds = cache['lower_bounds']
        upper_bounds = cache['upper_bounds']
        countries = cache['countries']
        ip_values = df_feat['ip_address'].values
        
        # Use searchsorted to find the potential matching range index for each IP
        # side='right' gives us index where ip would be inserted to keep order
        # subtracting 1 gives us the last range where lower_bound <= ip
        indices = np.searchsorted(lower_bounds, ip_values, side='right') - 1
        
        # Clip indices to valid range [0, len-1]
        indices = np.clip(indices, 0, len(lower_bounds) - 1)
        
        # Check if IPs actually fall within the found ranges (lower <= ip <= upper)
        valid_mask = (ip_values >= lower_bounds[indices]) & (ip_values <= upper_bounds[indices])
        
        # Map countries - use 'Unknown' for IPs that don't match any range
        df_feat['country'] = np.where(valid_mask, countries[indices], 'Unknown')
        
        logger.info(f"Mapped IP addresses. Found {valid_mask.sum()} matches")
        self.feature_log.append("Mapped IP addresses to countries")
        
        return df_feat
    
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
        user_counts = df_feat['user_id'].value_counts()
        df_feat['user_transaction_count'] = df_feat['user_id'].map(user_counts)
        
        # Device transaction count
        device_counts = df_feat['device_id'].value_counts()
        df_feat['device_transaction_count'] = df_feat['device_id'].map(device_counts)
        
        # Purchase value per user (average)
        user_avg_purchase = df_feat.groupby('user_id')['purchase_value'].mean()
        df_feat['user_avg_purchase'] = df_feat['user_id'].map(user_avg_purchase)
        
        # Deviation from user's average purchase
        df_feat['purchase_deviation'] = df_feat['purchase_value'] - df_feat['user_avg_purchase']
        
        logger.info("Created frequency features: user_transaction_count, device_transaction_count, etc.")
        self.feature_log.append("Created 4 frequency features")
        
        return df_feat
    
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
        
        categorical_cols = ['source', 'browser', 'sex']
        
        if encoding_type == 'onehot':
            # One-hot encoding
            df_feat = pd.get_dummies(df_feat, columns=categorical_cols, 
                                     prefix=categorical_cols, drop_first=True)
            logger.info(f"One-hot encoded {len(categorical_cols)} categorical features")
            self.feature_log.append(f"One-hot encoded: {', '.join(categorical_cols)}")
        
        elif encoding_type == 'label':
            # Label encoding
            from sklearn.preprocessing import LabelEncoder
            
            for col in categorical_cols:
                if col in df_feat.columns:
                    le = LabelEncoder()
                    df_feat[col + '_encoded'] = le.fit_transform(df_feat[col].astype(str))
            
            logger.info(f"Label encoded {len(categorical_cols)} categorical features")
            self.feature_log.append(f"Label encoded: {', '.join(categorical_cols)}")
        
        return df_feat
    
    def get_feature_report(self) -> str:
        """
        Get a report of all feature engineering operations.
        
        Returns:
            String containing the feature engineering log
        """
        if not self.feature_log:
            return "No feature engineering operations performed yet."
        
        report = "Feature Engineering Report\n"
        report += "=" * 50 + "\n"
        for i, log_entry in enumerate(self.feature_log, 1):
            report += f"{i}. {log_entry}\n"
        
        return report
