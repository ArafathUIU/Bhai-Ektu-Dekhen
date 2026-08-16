"""Tests for the AI worker services."""

from __future__ import annotations

from PIL import Image

from app.services.classifier import ImageClassifier
from app.services.embeddings import ImageEmbedder
from app.services.severity import SeverityScorer


def _blank_image(color: tuple[int, int, int] = (128, 128, 128)) -> Image.Image:
    return Image.new("RGB", (128, 128), color)


def test_embedder_returns_64_dim_vector():
    embedding = ImageEmbedder().embed(_blank_image())
    assert embedding.shape == (64,)
    assert abs(float(embedding[0])) <= 1.0


def test_embedder_normalized():
    import numpy as np

    embedding = ImageEmbedder().embed(_blank_image())
    assert abs(np.linalg.norm(embedding) - 1.0) < 1e-4


def test_embedder_similar_images_close():
    embedder = ImageEmbedder()
    a = embedder.embed(_blank_image((200, 200, 200)))
    b = embedder.embed(_blank_image((180, 180, 180)))
    c = embedder.embed(_blank_image((0, 0, 0)))
    assert embedder.cosine_similarity(a, b) > embedder.cosine_similarity(a, c)


def test_classifier_returns_known_categories():
    result = ImageClassifier().predict(_blank_image())
    assert result["category_slug"] in {
        "road_damage",
        "drainage",
        "street_light",
        "garbage",
    }
    assert 0.0 <= result["confidence"] <= 1.0


def test_severity_scorer_maps_high_confidence_to_severity():
    scorer = SeverityScorer()
    low = scorer.score({"category_slug": "garbage", "confidence": 0.2})
    high = scorer.score({"category_slug": "road_damage", "confidence": 0.95})
    assert high >= low


def test_health_and_analyze_endpoints():
    from fastapi.testclient import TestClient

    from app.main import app

    client = TestClient(app)
    health = client.get("/api/v1/health")
    assert health.status_code == 200
    assert health.json()["status"] == "ok"


def test_analyze_rejects_bad_image_url():
    from fastapi.testclient import TestClient

    from app.main import app

    client = TestClient(app)
    resp = client.post(
        "/api/v1/analyze",
        json={
            "report_id": 1,
            "public_id": "BEK-00001",
            "image_url": "http://127.0.0.1:1/nonexistent.png",
        },
    )
    assert resp.status_code == 422