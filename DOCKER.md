# Docker Run Guide

This project is containerized with two services:

- Django API: http://localhost:8000
- FastAPI fraud model: http://localhost:8001

## Build and run

```bash
docker compose up --build
```

## Stop

```bash
docker compose down
```

## Notes

- Django calls FastAPI via internal Compose DNS using:
  - `FRAUD_MODEL_API_URL=http://fastapi:8001/predict`
- OCR is enabled in the Django container via system package `tesseract-ocr`.
- If you want to keep sqlite data across container rebuilds, add a volume mount for `campus/db.sqlite3`.
