# Fraud Detection Model

## Project Overview
This project aims to detect fraudulent transactions using machine learning techniques. The analysis combines multiple datasets including transaction data, IP address mappings, and credit card fraud records to build a comprehensive fraud detection system.

## Business Objective
Develop a robust machine learning model to identify fraudulent transactions in real-time, reducing financial losses and improving customer trust by:
- Analyzing transaction patterns and user behavior
- Identifying high-risk transactions based on geographic and temporal features
- Minimizing false positives to maintain customer satisfaction

## Datasets
The project uses three main datasets:

1. **Fraud_Data.csv**: E-commerce transaction data
   - 151,112 transactions
   - Features: user_id, signup_time, purchase_time, purchase_value, device_id, source, browser, sex, age, ip_address, class

2. **IpAddress_to_Country.csv**: IP geolocation mapping
   - 138,846 IP ranges mapped to countries
   - Features: lower_bound_ip_address, upper_bound_ip_address, country

3. **creditcard.csv**: Credit card transaction data
   - 284,807 transactions
   - Features: Time, V1-V28 (PCA-transformed), Amount, Class

## Installation

### Prerequisites
- Python 3.8 or higher
- Virtual environment (recommended)

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd fraud-detection-model

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

## Project Structure
```
fraud-detection-model/
├── data/
│   ├── raw/              # Raw data files (git-ignored)
│   └── processed/        # Cleaned and processed data
├── notebooks/
│   ├── 01_data_cleaning.ipynb
│   ├── 02_exploratory_data_analysis.ipynb
│   ├── 03_feature_engineering.ipynb
│   └── 04_class_imbalance_handling.ipynb
├── src/
│   ├── data_loader.py
│   ├── data_cleaner.py
│   ├── feature_engineer.py
│   └── preprocessor.py
├── tests/                # Unit tests
├── models/               # Trained models
├── docs/                 # Documentation
├── .gitignore
├── requirements.txt
└── README.md
```

## Usage

### Running Notebooks
Execute notebooks in order:
```bash
jupyter notebook
# Open and run: 01_data_cleaning.ipynb → 02_exploratory_data_analysis.ipynb → ...
```

### Using Python Scripts
```python
from src.data_loader import DataLoader
from src.data_cleaner import DataCleaner

# Load data
loader = DataLoader()
df = loader.load_fraud_data('data/raw/Fraud_Data.csv')

# Clean data
cleaner = DataCleaner()
df_clean = cleaner.handle_missing_values(df)
```

## Key Findings (Interim Results)
- Class imbalance: Approximately 90% non-fraud, 10% fraud transactions
- Time-based patterns: Higher fraud rates during specific hours
- Geographic insights: Certain regions show elevated fraud risk
- Feature importance: Time since signup and transaction amount are strong indicators

## Next Steps
1. Model training with balanced dataset
2. Hyperparameter tuning
3. Model evaluation and comparison
4. Production deployment pipeline

## Contributors
- Mohammed Sultan

## License
This project is part of an academic/professional assessment.
