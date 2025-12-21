"""
Data Loader Module for Fraud Detection Project.

This module provides classes and functions to load various datasets
used in the fraud detection analysis.
"""

import pandas as pd
from typing import Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataLoader:
    """Load and validate fraud detection datasets."""
    
    def __init__(self):
        """Initialize the DataLoader."""
        self.fraud_data = None
        self.ip_mapping = None
        self.creditcard_data = None
    
    def load_fraud_data(self, filepath: str) -> pd.DataFrame:
        """
        Load fraud transaction data from CSV file.
        
        Args:
            filepath: Path to the Fraud_Data.csv file
            
        Returns:
            DataFrame containing fraud transaction data
            
        Raises:
            FileNotFoundError: If the file doesn't exist
            ValueError: If the file format is invalid
        """
        try:
            logger.info(f"Loading fraud data from {filepath}")
            df = pd.read_csv(filepath)
            
            # Validate expected columns
            expected_cols = ['user_id', 'signup_time', 'purchase_time', 
                           'purchase_value', 'device_id', 'source', 
                           'browser', 'sex', 'age', 'ip_address', 'class']
            
            missing_cols = set(expected_cols) - set(df.columns)
            if missing_cols:
                raise ValueError(f"Missing columns: {missing_cols}")
            
            logger.info(f"Loaded {len(df)} fraud records")
            self.fraud_data = df
            return df
            
        except FileNotFoundError:
            logger.error(f"File not found: {filepath}")
            raise
        except Exception as e:
            logger.error(f"Error loading fraud data: {str(e)}")
            raise
    
    def load_ip_mapping(self, filepath: str) -> pd.DataFrame:
        """
        Load IP address to country mapping data.
        
        Args:
            filepath: Path to the IpAddress_to_Country.csv file
            
        Returns:
            DataFrame containing IP to country mappings
            
        Raises:
            FileNotFoundError: If the file doesn't exist
            ValueError: If the file format is invalid
        """
        try:
            logger.info(f"Loading IP mapping data from {filepath}")
            df = pd.read_csv(filepath)
            
            # Validate expected columns
            expected_cols = ['lower_bound_ip_address', 'upper_bound_ip_address', 'country']
            missing_cols = set(expected_cols) - set(df.columns)
            if missing_cols:
                raise ValueError(f"Missing columns: {missing_cols}")
            
            logger.info(f"Loaded {len(df)} IP mapping records")
            self.ip_mapping = df
            return df
            
        except FileNotFoundError:
            logger.error(f"File not found: {filepath}")
            raise
        except Exception as e:
            logger.error(f"Error loading IP mapping data: {str(e)}")
            raise
    
    def load_creditcard_data(self, filepath: str) -> pd.DataFrame:
        """
        Load credit card transaction data.
        
        Args:
            filepath: Path to the creditcard.csv file
            
        Returns:
            DataFrame containing credit card transaction data
            
        Raises:
            FileNotFoundError: If the file doesn't exist
            ValueError: If the file format is invalid
        """
        try:
            logger.info(f"Loading credit card data from {filepath}")
            df = pd.read_csv(filepath)
            
            # Validate that required columns exist
            if 'Time' not in df.columns or 'Amount' not in df.columns or 'Class' not in df.columns:
                raise ValueError("Missing required columns (Time, Amount, or Class)")
            
            logger.info(f"Loaded {len(df)} credit card transaction records")
            self.creditcard_data = df
            return df
            
        except FileNotFoundError:
            logger.error(f"File not found: {filepath}")
            raise
        except Exception as e:
            logger.error(f"Error loading credit card data: {str(e)}")
            raise
    
    def get_data_summary(self) -> dict:
        """
        Get summary statistics for all loaded datasets.
        
        Returns:
            Dictionary containing summary information for each dataset
        """
        summary = {}
        
        if self.fraud_data is not None:
            summary['fraud_data'] = {
                'rows': len(self.fraud_data),
                'columns': len(self.fraud_data.columns),
                'memory_usage_mb': self.fraud_data.memory_usage(deep=True).sum() / 1024**2
            }
        
        if self.ip_mapping is not None:
            summary['ip_mapping'] = {
                'rows': len(self.ip_mapping),
                'columns': len(self.ip_mapping.columns),
                'memory_usage_mb': self.ip_mapping.memory_usage(deep=True).sum() / 1024**2
            }
        
        if self.creditcard_data is not None:
            summary['creditcard'] = {
                'rows': len(self.creditcard_data),
                'columns': len(self.creditcard_data.columns),
                'memory_usage_mb': self.creditcard_data.memory_usage(deep=True).sum() / 1024**2
            }
        
        return summary
