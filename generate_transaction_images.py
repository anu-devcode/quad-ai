from __future__ import annotations

import random
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "random_forest.joblib"
SCALER_PATH = MODELS_DIR / "scaler.joblib"
OUTPUT_DIR = BASE_DIR / "generated_transactions"

LOW_RISK_THRESHOLD = 0.30
HIGH_RISK_THRESHOLD = 0.65


@dataclass
class PredictionResult:
    prediction: int
    fraud_probability: float
    legitimate_probability: float
    risk_level: str


def get_risk_level(fraud_prob: float) -> str:
    if fraud_prob < LOW_RISK_THRESHOLD:
        return "Low"
    if fraud_prob < HIGH_RISK_THRESHOLD:
        return "Medium"
    return "High"


def get_operational_risk_probability(payload: dict[str, Any], fraud_prob: float) -> float:
    adjusted = float(fraud_prob)

    parsing_success = float(payload["parsing_success"])
    source_confidence = float(payload["source_confidence"])
    purchase_value = float(payload["purchase_value"])

    if parsing_success < 0.5:
        adjusted += 0.15
    elif parsing_success < 0.8:
        adjusted += 0.05

    if source_confidence < 0.5:
        adjusted += 0.10
    elif source_confidence < 0.8:
        adjusted += 0.05

    if purchase_value > 500:
        adjusted += min(0.10, (purchase_value - 500) / 100000.0)

    signup_dt = datetime.strptime(payload["signup_time"], "%Y-%m-%d %H:%M:%S")
    purchase_dt = datetime.strptime(payload["purchase_time"], "%Y-%m-%d %H:%M:%S")
    time_since_signup = max((purchase_dt - signup_dt).total_seconds() / 3600.0, 0.0)

    if time_since_signup < 1:
        adjusted += 0.15
    elif time_since_signup < 24:
        adjusted += 0.05

    return float(max(0.0, min(adjusted, 0.99)))


def preprocess_payload(payload: dict[str, Any], scaler: Any) -> np.ndarray:
    signup_dt = datetime.strptime(payload["signup_time"], "%Y-%m-%d %H:%M:%S")
    purchase_dt = datetime.strptime(payload["purchase_time"], "%Y-%m-%d %H:%M:%S")

    time_since_signup = (purchase_dt - signup_dt).total_seconds() / 3600.0
    purchase_hour = purchase_dt.hour
    purchase_day_of_week = purchase_dt.weekday()
    purchase_month = purchase_dt.month
    purchase_day_of_month = purchase_dt.day
    is_weekend = 1 if purchase_day_of_week >= 5 else 0

    user_avg_purchase = (
        float(payload["user_avg_purchase"])
        if payload.get("user_avg_purchase") is not None
        else float(payload["purchase_value"])
    )

    features = {
        "purchase_value": float(payload["purchase_value"]),
        "age": int(payload["age"]),
        "ip_address": float(payload["ip_address"]),
        "time_since_signup": time_since_signup,
        "purchase_hour": purchase_hour,
        "purchase_day_of_week": purchase_day_of_week,
        "purchase_month": purchase_month,
        "purchase_day_of_month": purchase_day_of_month,
        "is_weekend": is_weekend,
        "user_id": int(payload["user_id"]),
        "user_transaction_count": int(payload["user_transaction_count"]),
        "device_transaction_count": int(payload["device_transaction_count"]),
        "user_avg_purchase": user_avg_purchase,
        "purchase_deviation": float(payload["purchase_value"]) - user_avg_purchase,
    }

    scaler_order = [
        "purchase_value",
        "age",
        "ip_address",
        "time_since_signup",
        "purchase_hour",
        "purchase_day_of_week",
        "purchase_month",
        "purchase_day_of_month",
        "is_weekend",
        "user_transaction_count",
        "device_transaction_count",
        "user_avg_purchase",
        "purchase_deviation",
    ]

    scaled = scaler.transform(np.array([[features[key] for key in scaler_order]]))[0]
    final_vector = np.concatenate(
        [scaled[:9], [float(features["user_id"])], scaled[9:]],
    ).reshape(1, -1)
    return final_vector


def classify_payload(payload: dict[str, Any], model: Any, scaler: Any) -> PredictionResult:
    vector = preprocess_payload(payload, scaler)
    probs = model.predict_proba(vector)[0]
    legitimate_prob = float(probs[0])
    fraud_prob = float(probs[1])
    pred = int(model.predict(vector)[0])

    operational = get_operational_risk_probability(payload, fraud_prob)
    risk_level = get_risk_level(operational)

    return PredictionResult(
        prediction=pred,
        fraud_probability=fraud_prob,
        legitimate_probability=legitimate_prob,
        risk_level=risk_level,
    )


def random_ip_int() -> int:
    return random.randint(100000, 4294967295)


def build_candidate(target_label: str, idx: int) -> dict[str, Any]:
    now = datetime.now().replace(microsecond=0)

    if target_label == "fraud":
        signup_time = now - timedelta(minutes=random.randint(1, 120), seconds=random.randint(0, 59))
        purchase_time = signup_time + timedelta(seconds=random.randint(5, 900))
        purchase_value = round(random.uniform(1200, 12000), 2)
        user_tx_count = random.randint(1, 3)
        device_tx_count = random.randint(10, 30)
        avg_purchase = round(random.uniform(60, 420), 2)
        parsing_success = round(random.uniform(0.20, 0.65), 2)
        source_confidence = round(random.uniform(0.20, 0.65), 2)
        source = random.choice(["screenshot", "sms", "pdf"])
        device_prefix = "fraud-device"
    else:
        signup_time = now - timedelta(days=random.randint(15, 700), hours=random.randint(1, 23))
        purchase_time = signup_time + timedelta(days=random.randint(1, 120), hours=random.randint(1, 12))
        purchase_value = round(random.uniform(15, 520), 2)
        user_tx_count = random.randint(4, 120)
        device_tx_count = random.randint(1, 12)
        avg_purchase = round(random.uniform(max(10, purchase_value * 0.6), purchase_value * 1.3), 2)
        parsing_success = round(random.uniform(0.85, 1.0), 2)
        source_confidence = round(random.uniform(0.85, 1.0), 2)
        source = random.choice(["manual", "screenshot", "sms"])
        device_prefix = "trusted-device"

    payload = {
        "user_id": 90000 + idx,
        "signup_time": signup_time.strftime("%Y-%m-%d %H:%M:%S"),
        "purchase_time": purchase_time.strftime("%Y-%m-%d %H:%M:%S"),
        "purchase_value": purchase_value,
        "device_id": f"{device_prefix}-{random.randint(10, 99)}",
        "source": source,
        "browser": random.choice(["Chrome", "Edge", "Safari", "Firefox"]),
        "sex": random.choice(["M", "F"]),
        "age": random.randint(18, 55),
        "ip_address": float(random_ip_int()),
        "user_transaction_count": user_tx_count,
        "device_transaction_count": device_tx_count,
        "user_avg_purchase": avg_purchase,
        "parsing_success": parsing_success,
        "source_confidence": source_confidence,
    }
    return payload


def _load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def render_image(payload: dict[str, Any], prediction: PredictionResult, out_path: Path) -> None:
    img = Image.new("RGB", (1200, 900), "#f5f7fb")
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle((70, 60, 1130, 840), radius=24, fill="#ffffff", outline="#1f2937", width=4)
    draw.rounded_rectangle((70, 60, 1130, 160), radius=24, fill="#0f172a")
    draw.rectangle((70, 136, 1130, 160), fill="#0f172a")

    title_font = _load_font(50, bold=True)
    sub_font = _load_font(34, bold=False)
    section_font = _load_font(46, bold=True)
    body_font = _load_font(41, bold=False)
    label_font = _load_font(20, bold=False)
    banner_font = _load_font(32, bold=True)

    draw.text((120, 86), "Campus Pay Transaction Record", font=title_font, fill="#ffffff")
    draw.text((120, 132), "OCR Test Document", font=sub_font, fill="#cbd5e1")
    draw.text((120, 214), "Transaction Details", font=section_font, fill="#111827")

    left_lines = [
        f"user_id: {payload['user_id']}",
        f"signup_time: {payload['signup_time']}",
        f"purchase_time: {payload['purchase_time']}",
        f"purchase_value: {payload['purchase_value']:.2f}",
        f"device_id: {payload['device_id']}",
        f"source: {payload['source']}",
        f"browser: {payload['browser']}",
        f"sex: {payload['sex']}",
        f"age: {payload['age']}",
        f"ip_address: {int(payload['ip_address'])}",
    ]

    right_lines = [
        f"user_transaction_count: {payload['user_transaction_count']}",
        f"device_transaction_count: {payload['device_transaction_count']}",
        f"user_avg_purchase: {payload['user_avg_purchase']:.1f}",
        f"parsing_success: {payload['parsing_success']:.2f}",
        f"source_confidence: {payload['source_confidence']:.2f}",
    ]

    y = 284
    for line in left_lines:
        draw.text((120, y), line, font=body_font, fill="#111827")
        y += 45

    y = 284
    for line in right_lines:
        draw.text((650, y), line, font=body_font, fill="#111827")
        y += 45

    draw.text(
        (120, 710),
        (
            f"model_prediction: {'Fraud' if prediction.prediction == 1 else 'Normal'}"
            f"  fraud_probability: {prediction.fraud_probability:.4f}"
        ),
        font=label_font,
        fill="#334155",
    )

    if prediction.prediction == 1:
        box_fill = "#fee2e2"
        box_border = "#ef4444"
        box_text = "#991b1b"
        message = "Warning: Model classified this transaction as potentially fraudulent."
    else:
        box_fill = "#dcfce7"
        box_border = "#22c55e"
        box_text = "#166534"
        message = "Status: Model classified this transaction as normal for testing."

    draw.rounded_rectangle((120, 742, 1080, 810), radius=16, fill=box_fill, outline=box_border, width=2)
    draw.text((150, 765), message, font=banner_font, fill=box_text)

    img.save(out_path, format="PNG")


def main() -> None:
    random.seed(20260405)

    if not MODEL_PATH.exists() or not SCALER_PATH.exists():
        raise FileNotFoundError(f"Model or scaler not found in {MODELS_DIR}")

    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    fraud_docs: list[tuple[dict[str, Any], PredictionResult]] = []
    normal_docs: list[tuple[dict[str, Any], PredictionResult]] = []

    idx = 1
    attempts = 0
    while (len(fraud_docs) < 6 or len(normal_docs) < 6) and attempts < 5000:
        attempts += 1
        target = "fraud" if len(fraud_docs) <= len(normal_docs) else "normal"
        payload = build_candidate(target, idx)
        result = classify_payload(payload, model, scaler)

        if result.prediction == 1 and len(fraud_docs) < 6:
            fraud_docs.append((payload, result))
            idx += 1
        elif result.prediction == 0 and len(normal_docs) < 6:
            normal_docs.append((payload, result))
            idx += 1

    if len(fraud_docs) < 6 or len(normal_docs) < 6:
        raise RuntimeError(
            f"Could not collect enough samples. fraud={len(fraud_docs)} normal={len(normal_docs)}",
        )

    records = fraud_docs + normal_docs
    records.sort(key=lambda item: item[1].fraud_probability, reverse=True)

    for i, (payload, result) in enumerate(records, start=1):
        label = "fraud" if result.prediction == 1 else "normal"
        filename = f"sample_transaction_{i:02d}_{label}.png"
        render_image(payload, result, OUTPUT_DIR / filename)

    print(f"Generated {len(records)} images in {OUTPUT_DIR}")
    print(f"Fraud: {sum(1 for _, r in records if r.prediction == 1)} | Normal: {sum(1 for _, r in records if r.prediction == 0)}")


if __name__ == "__main__":
    main()
