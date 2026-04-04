import streamlit as st
import pandas as pd
import requests
import json
import os
from datetime import datetime

# --- SETTINGS & CONFIG ---
API_URL = os.getenv("API_URL", "http://127.0.0.1:8000/predict")

st.set_page_config(
    page_title="FraudShield | Detection Dashboard",
    page_icon="🛡️",
    layout="wide"
)

# Custom Styling for Light Mode & Premium Look
st.markdown("""
    <style>
    .main {
        background-color: #f8f9fa;
    }
    .stMetric {
        background-color: white;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .risk-high { background-color: #ffe5e5; color: #cc0000; padding: 10px; border-radius: 5px; border: 1px solid #ff9999; }
    .risk-medium { background-color: #fff9e6; color: #856404; padding: 10px; border-radius: 5px; border: 1px solid #ffeeba; }
    .risk-low { background-color: #e6ffed; color: #1e7e34; padding: 10px; border-radius: 5px; border: 1px solid #b7eb8f; }
    </style>
""", unsafe_allow_html=True)

# --- SIDEBAR ---
st.sidebar.title("🛡️ FraudShield")
st.sidebar.markdown("---")
view_mode = st.sidebar.radio("Select View Mode", ["Manual Entry", "Batch Upload (CSV)"])

st.sidebar.info("This dashboard connects to the Fraud Detection FastAPI service to provide real-time risk assessments.")

# --- HELPERS ---
def get_prediction(data):
    try:
        response = requests.post(API_URL, json=data)
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"API Error: {response.status_code} - {response.text}"}
    except Exception as e:
        return {"error": f"Connection Error: {str(e)}"}

# --- MAIN CONTENT ---
if view_mode == "Manual Entry":
    st.header("🔍 Single Transaction Analysis")
    st.write("Fill in the transaction details to evaluate fraud risk.")
    
    with st.form("manual_form"):
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("👤 User Information")
            user_id = st.number_input("User ID", min_value=0, value=22058)
            age = st.number_input("Age", min_value=1, max_value=120, value=30)
            sex = st.selectbox("Sex", ["M", "F"])
            ip_address = st.number_input("IP Address (Numeric)", value=732758368.0)
            st.subheader("💻 Device/Source")
            device_id = st.text_input("Device ID", value="DEV123")
            source = st.selectbox("Source", ["SEO", "Direct", "Ads"])
            browser = st.selectbox("Browser", ["Chrome", "FireFox", "Safari", "IE", "Opera"])

        with col2:
            st.subheader("💳 Transaction Details")
            purchase_value = st.number_input("Purchase Value ($)", min_value=0.0, value=50.0)
            signup_date = st.date_input("Signup Date", value=datetime(2026, 1, 1))
            signup_time_val = st.time_input("Signup Time", value=datetime(2026, 1, 1, 10, 0, 0).time())
            purchase_date = st.date_input("Purchase Date", value=datetime(2026, 1, 2))
            purchase_time_val = st.time_input("Purchase Time", value=datetime(2026, 1, 2, 12, 0, 0).time())
            
            st.subheader("📊 Analytics Context")
            ut_count = st.number_input("User Transaction Count", min_value=1, value=1)
            dt_count = st.number_input("Device Transaction Count", min_value=1, value=1)
            avg_p = st.number_input("User Avg Purchase ($)", value=0.0, help="If 0, current purchase will be used as average.")

        submit = st.form_submit_button("Run Risk Assessment")

    if submit:
        # Prepare times in YYYY-MM-DD HH:MM:SS
        signup_iso = f"{signup_date} {signup_time_val}"
        purchase_iso = f"{purchase_date} {purchase_time_val}"
        
        payload = {
            "user_id": user_id,
            "signup_time": signup_iso,
            "purchase_time": purchase_iso,
            "purchase_value": purchase_value,
            "device_id": device_id,
            "source": source,
            "browser": browser,
            "sex": sex,
            "age": age,
            "ip_address": ip_address,
            "user_transaction_count": ut_count,
            "device_transaction_count": dt_count
        }
        if avg_p > 0:
            payload["user_avg_purchase"] = avg_p

        with st.spinner("Analyzing..."):
            result = get_prediction(payload)

        if "error" in result:
            st.error(result["error"])
        else:
            # Result Display
            st.markdown("---")
            res_col1, res_col2, res_col3 = st.columns(3)
            
            with res_col1:
                risk = result['risk_level']
                style_class = f"risk-{risk.lower()}"
                st.markdown(f"### Risk Assessment\n<div class='{style_class}' style='font-size:24px; font-weight:bold; text-align:center;'>{risk}</div>", unsafe_allow_html=True)
            
            with res_col2:
                st.metric("Fraud Probability", f"{result['fraud_probability']:.2%}")
            
            with res_col3:
                st.metric("Legit Probability", f"{result['legitimate_probability']:.2%}")
            
            if result['prediction'] == 1:
                st.warning("⚠️ High vigilance recommended: The transaction flagged as potentially fraudulent by the model.")
            else:
                st.success("🏁 The transaction appears to be legitimate based on statistical patterns.")

elif view_mode == "Batch Upload (CSV)":
    st.header("📂 Batch CSV Intelligence")
    st.write("Upload a CSV file with transaction data for bulk risk scoring.")
    
    uploaded_file = st.file_uploader("Choose a CSV file", type="csv")
    
    if uploaded_file is not None:
        df = pd.read_csv(uploaded_file)
        st.subheader("Data Preview")
        st.dataframe(df.head(), use_container_width=True)
        
        if st.button("Process Bulk Predictions"):
            # Check for required columns
            required_cols = ['user_id', 'signup_time', 'purchase_time', 'purchase_value', 
                            'device_id', 'source', 'browser', 'sex', 'age', 'ip_address']
            missing = [c for c in required_cols if c not in df.columns]
            
            if missing:
                st.error(f"Missing required columns: {missing}")
            else:
                results = []
                progress_bar = st.progress(0)
                status_text = st.empty()
                
                rows = df.to_dict('records')
                total = len(rows)
                
                for i, row in enumerate(rows):
                    # Ensure times are strings
                    row['signup_time'] = str(row['signup_time'])
                    row['purchase_time'] = str(row['purchase_time'])
                    
                    # Call API
                    res = get_prediction(row)
                    
                    if "error" in res:
                        results.append({"Risk": "Error", "Prob": 0.0})
                    else:
                        results.append({
                            "Prediction": res['prediction'],
                            "Probability": f"{res['fraud_probability']:.4f}",
                            "Risk Level": res['risk_level']
                        })
                    
                    progress_bar.progress((i + 1) / total)
                    status_text.text(f"Processing row {i+1} of {total}...")
                
                # Combine results
                res_df = pd.concat([df, pd.DataFrame(results)], axis=1)
                
                st.success("Processing Complete!")
                st.subheader("Analysis Results")
                
                # Highlight risks
                def color_risk(val):
                    color = 'red' if val == 'High' else ('orange' if val == 'Medium' else 'green')
                    return f'color: {color}'

                st.dataframe(res_df.style.applymap(color_risk, subset=['Risk Level']), use_container_width=True)
                
                # Download button
                csv_out = res_df.to_csv(index=False).encode('utf-8')
                st.download_button(
                    label="Download Annotated Results",
                    data=csv_out,
                    file_name="fraud_analysis_results.csv",
                    mime="text/csv",
                )
