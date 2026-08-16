from __future__ import annotations

import os
from pathlib import Path
from typing import ClassVar

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """AI worker runtime configuration."""

    app_name: str = "Bhai Ektu Dekhen AI Worker"
    api_v1_prefix: str = "/api/v1"

    # Where the Laravel backend accepts AI results.
    backend_result_url: str = os.getenv(
        "BACKEND_RESULT_URL", "http://127.0.0.1:8000/api/v1/internal/ai-results"
    )
    backend_token: str = os.getenv("BACKEND_WORKER_TOKEN", "worker-token-change-me")

    # Image classification.
    min_confidence: float = 0.35

    # Duplicate detection.
    duplicate_geo_radius_m: float = 300.0
    duplicate_image_threshold: float = 0.75
    duplicate_text_threshold: float = 0.60
    duplicate_overall_threshold: float = 0.70

    model_settings: ClassVar[dict] = dict(env_prefix="AI_", env_file=".env")


settings = Settings()
