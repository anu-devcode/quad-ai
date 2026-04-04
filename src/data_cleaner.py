"""
Data Cleaner Module for Fraud Detection Project.

This module provides classes and functions to clean and preprocess raw data.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataCleaner:
    """Clean and preprocess raw fraud detection data."""
    
    def __init__(self):
        """Initialize the DataCleaner."""
        self.cleaning_log = []
    
    def handle_missing_values(self, df: pd.DataFrame, strategy: str = 'auto') -> pd.DataFrame:
        """
        Handle missing values using appropriate strategies.
        
        Args:
            df: Input DataFrame
            strategy: Strategy for handling missing values ('auto', 'drop', 'impute')
            
        Returns:
            DataFrame with missing values handled
        """
        df_clean = df.copy()
        missing_counts = df_clean.isnull().sum()
        missing_cols = missing_counts[missing_counts > 0]
        
        if len(missing_cols) == 0:
            logger.info("No missing values found")
            return df_clean
        
        logger.info(f"Found missing values in {len(missing_cols)} columns")
        
        for col in missing_cols.index:
            missing_pct = (missing_counts[col] / len(df_clean)) * 100
            logger.info(f"  {col}: {missing_counts[col]} ({missing_pct:.2f}%)")
            
            if strategy == 'auto':
                if missing_pct < 5:
                    # Drop rows if less than 5% missing
                    df_clean = df_clean.dropna(subset=[col])
                    self.cleaning_log.append(f"Dropped {missing_counts[col]} rows with missing {col}")
                else:
                    # Impute if more than 5% missing
                    if df_clean[col].dtype in ['int64', 'float64']:
                        df_clean[col].fillna(df_clean[col].median(), inplace=True)
                        self.cleaning_log.append(f"Imputed {col} with median")
                    else:
                        df_clean[col].fillna(df_clean[col].mode()[0], inplace=True)
                        self.cleaning_log.append(f"Imputed {col} with mode")
            elif strategy == 'drop':
                df_clean = df_clean.dropna(subset=[col])
                self.cleaning_log.append(f"Dropped rows with missing {col}")
        
        return df_clean
    
    def remove_duplicates(self, df: pd.DataFrame, subset: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Remove duplicate records.
        
        Args:
            df: Input DataFrame
            subset: Columns to consider for identifying duplicates
            
        Returns:
            DataFrame with duplicates removed
        """
        df_clean = df.copy()
        initial_count = len(df_clean)
        
        if subset:
            df_clean = df_clean.drop_duplicates(subset=subset, keep='first')
            logger.info(f"Removed {initial_count - len(df_clean)} duplicate records based on {subset}")
        else:
            df_clean = df_clean.drop_duplicates(keep='first')
            logger.info(f"Removed {initial_count - len(df_clean)} exact duplicate records")
        
        self.cleaning_log.append(f"Removed {initial_count - len(df_clean)} duplicates")
        return df_clean
    
    def convert_data_types(self, df: pd.DataFrame, datetime_cols: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Convert columns to appropriate data types.
        
        Args:
            df: Input DataFrame
            datetime_cols: List of columns to convert to datetime
            
        Returns:
            DataFrame with converted data types
        """
        df_clean = df.copy()
        
        if datetime_cols:
            for col in datetime_cols:
                if col in df_clean.columns:
                    try:
                        df_clean[col] = pd.to_datetime(df_clean[col])
                        logger.info(f"Converted {col} to datetime")
                        self.cleaning_log.append(f"Converted {col} to datetime")
                    except Exception as e:
                        logger.warning(f"Could not convert {col} to datetime: {str(e)}")
        
        return df_clean
    
    def validate_ranges(self, df: pd.DataFrame, range_dict: Dict[str, tuple]) -> pd.DataFrame:
        """
        Validate and filter data based on expected ranges.
        
        Args:
            df: Input DataFrame
            range_dict: Dictionary of column names and (min, max) tuples
            
        Returns:
            DataFrame with values outside ranges removed or clipped
        """
        df_clean = df.copy()
        
        for col, (min_val, max_val) in range_dict.items():
            if col in df_clean.columns:
                # Count out-of-range values
                out_of_range = ((df_clean[col] < min_val) | (df_clean[col] > max_val)).sum()
                
                if out_of_range > 0:
                    logger.warning(f"Found {out_of_range} out-of-range values in {col}")
                    # Clip values to range
                    df_clean[col] = df_clean[col].clip(lower=min_val, upper=max_val)
                    self.cleaning_log.append(f"Clipped {out_of_range} values in {col} to [{min_val}, {max_val}]")
        
        return df_clean
    
    def get_cleaning_report(self) -> str:
        """
        Get a report of all cleaning operations performed.
        
        Returns:
            String containing the cleaning log
        """
        if not self.cleaning_log:
            return "No cleaning operations performed yet."
        
        report = "Data Cleaning Report\n"
        report += "=" * 50 + "\n"
        for i, log_entry in enumerate(self.cleaning_log, 1):
            report += f"{i}. {log_entry}\n"
        
        return report
