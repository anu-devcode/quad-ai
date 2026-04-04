from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List


@dataclass
class ComponentCheck:
    name: str
    required: bool
    present: bool
    details: str

    def to_dict(self) -> Dict[str, object]:
        return {
            "name": self.name,
            "required": self.required,
            "present": self.present,
            "details": self.details,
        }


class ProjectVerificationService:
    @staticmethod
    def _workspace_root() -> Path:
        # campus/payments/project_verifier.py -> workspace root
        return Path(__file__).resolve().parents[2]

    @staticmethod
    def _read_text(path: Path) -> str:
        try:
            return path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            return path.read_text(encoding="utf-16")
        except OSError:
            return ""

    @classmethod
    def build_report(cls) -> Dict[str, object]:
        root = cls._workspace_root()

        checks: List[ComponentCheck] = []

        # Django backend structure
        django_files = [
            root / "campus" / "payments" / "models.py",
            root / "campus" / "payments" / "views.py",
            root / "campus" / "payments" / "urls.py",
            root / "campus" / "campus" / "settings.py",
        ]
        checks.append(
            ComponentCheck(
                name="django_backend_structure",
                required=True,
                present=all(path.exists() for path in django_files),
                details="Checks payments models/views/urls and project settings.",
            )
        )

        # FastAPI service and /predict endpoint
        fastapi_path = root / "src" / "api.py"
        fastapi_text = cls._read_text(fastapi_path) if fastapi_path.exists() else ""
        checks.append(
            ComponentCheck(
                name="fastapi_predict_service",
                required=True,
                present=fastapi_path.exists() and "@app.post(\"/predict\"" in fastapi_text,
                details="FastAPI app with POST /predict endpoint.",
            )
        )

        # OCR pipeline with pytesseract integration and preprocessing
        ocr_path = root / "campus" / "payments" / "ocr_service.py"
        ocr_text = cls._read_text(ocr_path) if ocr_path.exists() else ""
        has_preprocess = "def preprocess_image" in ocr_text and "cv2.threshold" in ocr_text
        has_tesseract = "pytesseract" in ocr_text and "image_to_string" in ocr_text
        checks.append(
            ComponentCheck(
                name="ocr_pipeline",
                required=True,
                present=ocr_path.exists() and has_preprocess and has_tesseract,
                details="Image preprocessing + Tesseract OCR extraction.",
            )
        )

        # Parser and validation layer
        has_parser = "def parse_transaction_data" in ocr_text
        views_path = root / "campus" / "payments" / "views.py"
        views_text = cls._read_text(views_path) if views_path.exists() else ""
        has_validation_signals = "validation_score" in ocr_text and "ValidationLog" in views_text
        checks.append(
            ComponentCheck(
                name="parser_and_validation_layer",
                required=True,
                present=has_parser and has_validation_signals,
                details="Regex parser + validation logging and scoring fields.",
            )
        )

        # Migrations coverage check
        migrations_dir = root / "campus" / "payments" / "migrations"
        migration_files = [p for p in migrations_dir.glob("*.py") if p.name != "__init__.py"] if migrations_dir.exists() else []
        checks.append(
            ComponentCheck(
                name="db_models_migrations_alignment",
                required=True,
                present=len(migration_files) > 0,
                details="Expected Django migration files besides __init__.py.",
            )
        )

        # Model artifacts path check
        models_dir = root / "models"
        has_model_file = (models_dir / "random_forest.joblib").exists()
        checks.append(
            ComponentCheck(
                name="model_artifacts",
                required=True,
                present=models_dir.exists() and has_model_file and (models_dir / "scaler.joblib").exists(),
                details="FastAPI random_forest model and scaler under models/.",
            )
        )

        # Optional frontend
        frontend_dir = root / "frontend" / "src"
        checks.append(
            ComponentCheck(
                name="frontend_structure_optional",
                required=False,
                present=frontend_dir.exists(),
                details="Optional frontend source folder.",
            )
        )

        present = [c.to_dict() for c in checks if c.present]
        missing = [c.to_dict() for c in checks if not c.present and c.required]
        optional_missing = [c.to_dict() for c in checks if not c.present and not c.required]

        status = "ready" if not missing else "gaps_found"

        return {
            "status": status,
            "summary": {
                "required_total": len([c for c in checks if c.required]),
                "required_present": len([c for c in checks if c.required and c.present]),
                "required_missing": len(missing),
                "optional_missing": len(optional_missing),
            },
            "present": present,
            "missing": missing,
            "optional_missing": optional_missing,
            "next_actions": cls._build_next_actions(missing),
        }

    @staticmethod
    def _build_next_actions(missing: List[Dict[str, object]]) -> List[str]:
        actions: List[str] = []
        missing_names = {str(item["name"]) for item in missing}

        if "db_models_migrations_alignment" in missing_names:
            actions.append("Run Django migrations generation: python manage.py makemigrations payments && python manage.py migrate")
        if "fastapi_predict_service" in missing_names:
            actions.append("Implement src/api.py with FastAPI app and POST /predict endpoint")
        if "ocr_pipeline" in missing_names:
            actions.append("Add OCR preprocessing + pytesseract extraction in payments/ocr_service.py")
        if "parser_and_validation_layer" in missing_names:
            actions.append("Add regex parser and validation scoring/logging in OCR and ingest view")
        if "model_artifacts" in missing_names:
            actions.append("Place random_forest.joblib and scaler.joblib under models/")

        if not actions:
            actions.append("No blocking gaps found. Proceed with ingestion -> feature extraction -> /predict scoring flow.")

        return actions
