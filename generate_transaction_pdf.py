from __future__ import annotations

import random

import joblib
from PIL import Image

import generate_transaction_images as tximg


def generate_single_transaction_pdf() -> None:
    random.seed(20260405)

    if not tximg.MODEL_PATH.exists() or not tximg.SCALER_PATH.exists():
        raise FileNotFoundError(f"Model or scaler not found in {tximg.MODELS_DIR}")

    model = joblib.load(tximg.MODEL_PATH)
    scaler = joblib.load(tximg.SCALER_PATH)

    tximg.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    payload = tximg.build_candidate(target_label="normal", idx=1)
    prediction = tximg.classify_payload(payload, model, scaler)

    png_path = tximg.OUTPUT_DIR / "sample_transaction_test.png"
    pdf_path = tximg.OUTPUT_DIR / "sample_transaction_test.pdf"

    # Reuse the same field layout/style as the PNG generator, then convert to PDF.
    tximg.render_image(payload, prediction, png_path)
    with Image.open(png_path) as image:
        image.convert("RGB").save(pdf_path, format="PDF", resolution=300.0)

    png_path.unlink(missing_ok=True)
    print(f"Generated 1 PDF file: {pdf_path}")


if __name__ == "__main__":
    generate_single_transaction_pdf()