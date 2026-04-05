# Deployment Guide

The repository now has two Docker entry points:

- `docker-compose.yml` for local development and quick smoke testing
- `docker-compose.coolify.yml` for production-style deployment on Coolify

## Local Run

```bash
docker compose up --build
```

That brings up the Django API and FastAPI model service.

## Production Stack

The Coolify stack is split into four services:

- `db`: Postgres 16 with a persistent volume
- `fastapi`: the ML scoring service on port `8001`
- `django`: the main API on port `8000`
- `frontend`: the public Nginx SPA on port `80`

The frontend is the public entrypoint. It serves the React app and proxies `/api/*` to the Django service over the internal Docker network.

## Required Environment Variables

Start from `.env.example` and set the production values in Coolify:

- `DJANGO_SECRET_KEY`
- `DJANGO_ALLOWED_HOSTS`
- `DJANGO_CSRF_TRUSTED_ORIGINS`
- `DJANGO_CORS_ALLOWED_ORIGINS`
- `DATABASE_URL`
- `FRAUD_MODEL_API_URL`

For the Coolify stack, `DATABASE_URL` should point at the Postgres service and `FRAUD_MODEL_API_URL` should point at the internal FastAPI service.

## Coolify Setup

1. Create a new Docker Compose application in Coolify from this repository.
2. Use `docker-compose.coolify.yml` as the compose file.
3. Add the variables from `.env.example` in the Coolify environment section.
4. Assign the public domain to the `frontend` service only.
5. Keep `django`, `fastapi`, and `db` private inside the compose network.
6. Make sure the Postgres volume is persistent.

## Health Endpoints

- Frontend: `/healthz`
- Django API: `/api/health/`
- FastAPI model service: `/health`

These are safe to use in Coolify health checks.

## Notes

- Django now uses Postgres when `DATABASE_URL` is set and falls back to SQLite locally.
- `collectstatic` runs automatically in the Django container startup sequence.
- OCR support still depends on the `tesseract-ocr` package inside the Django image.
