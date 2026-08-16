"""Main FastAPI application for the Bhai Ektu Dekhen AI worker."""

from __future__ import annotations

import io
import logging
import time

import requests
from fastapi import FastAPI, HTTPException
from PIL import Image

from app import __version__
from app.config import settings
from app.schemas import AnalyzeRequest, AnalyzeResponse, ClassificationResult, HealthResponse
from app.services.classifier import ImageClassifier
from app.services.embeddings import ImageEmbedder
from app.services.severity import SeverityScorer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bek-ai")

app = FastAPI(title=settings.app_name, version=__version__)

classifier = ImageClassifier()
embedder = ImageEmbedder()
scorer = SeverityScorer()


@app.get(f"{settings.api_v1_prefix}/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model_loaded=True,
        version=__version__,
    )


@app.post(
    f"{settings.api_v1_prefix}/analyze",
    response_model=AnalyzeResponse,
    tags=["inference"],
)
def analyze(payload: AnalyzeRequest) -> AnalyzeResponse:
    started = time.perf_counter()

    try:
        image_bytes = _fetch_image(payload.image_url)
        image = Image.open(io.BytesIO(image_bytes))
        image.load()
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not load image for report %s: %s", payload.public_id, exc)
        raise HTTPException(status_code=422, detail=f"Could not load image: {exc}") from exc

    classification = classifier.predict(image)
    severity = scorer.score(classification)
    embedding = embedder.embed(image)

    elapsed_ms = int((time.perf_counter() - started) * 1000)

    return AnalyzeResponse(
        report_id=payload.report_id,
        public_id=payload.public_id,
        status="COMPLETED",
        classification=ClassificationResult(
            category_slug=classification["category_slug"],
            category_name=classification["category_name"],
            confidence=classification["confidence"],
        ),
        severity_score=severity,
        embedding=[float(x) for x in embedding],
        embedding_dim=int(embedding.shape[0]),
        processing_time_ms=elapsed_ms,
        model_name=f"{classifier.model_name}|{embedder.model_name}",
        model_version="1",
    )


def _fetch_image(url: str) -> bytes:
    """Download the report image. Supports http(s) URLs."""
    if not url.startswith(("http://", "https://")):
        raise ValueError("image_url must be an absolute http(s) URL")
    response = requests.get(url, timeout=20)
    response.raise_for_status()
    return response.content
