import requests
import time
import json

# Define the base URL
BASE_URL = "http://127.0.0.1:8000"

def test_root():
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def test_predict_normal():
    # A normal looking request
    payload = {
        "user_id": 12345,
        "signup_time": "2026-01-01 10:00:00",
        "purchase_time": "2026-01-02 12:00:00", # Gap of 26 hours
        "purchase_value": 50.0,
        "device_id": "DEV6789",
        "source": "SEO",
        "browser": "Chrome",
        "sex": "M",
        "age": 30,
        "ip_address": 123456789.0,
        "user_transaction_count": 1,
        "device_transaction_count": 1
    }
    
    print("\n--- Testing Normal Transaction ---")
    response = requests.post(f"{BASE_URL}/predict", json=payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Error: {response.text}")

def test_predict_fraudulent():
    # A suspicious request (very fast purchase after signup)
    payload = {
        "user_id": 99999,
        "signup_time": "2026-04-04 07:00:00",
        "purchase_time": "2026-04-04 07:00:01", # 1 second after signup!
        "purchase_value": 500.0,
        "device_id": "FRAUD_DEV_01",
        "source": "Direct",
        "browser": "Safari",
        "sex": "F",
        "age": 22,
        "ip_address": 9876543210.0,
        "user_transaction_count": 50, # High velocity
        "device_transaction_count": 50
    }
    
    print("\n--- Testing Fraudulent Transaction ---")
    response = requests.post(f"{BASE_URL}/predict", json=payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    # Note: Make sure the API is running in another terminal OR 
    # run it in background first.
    try:
        test_root()
        test_predict_normal()
        test_predict_fraudulent()
    except Exception as e:
        print(f"Connection failed: {e}. Is the API running?")
