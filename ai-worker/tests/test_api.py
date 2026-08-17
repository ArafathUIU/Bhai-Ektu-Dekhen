"""Integration tests for the /analyze endpoint with a real image server."""

from __future__ import annotations

import io
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app


class _ImageHandler(BaseHTTPRequestHandler):
    def do_GET(self):  # noqa: N802
        image = Image.new("RGB", (128, 128), (120, 60, 10))
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        payload = buffer.getvalue()
        self.send_response(200)
        self.send_header("Content-Type", "image/png")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, *args):  # noqa: ANN002
        pass


@pytest.fixture(scope="module")
def image_server():
    server = HTTPServer(("127.0.0.1", 0), _ImageHandler)
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{port}/pothole.png"
    server.shutdown()


def test_analyze_completes_with_real_image(image_server):
    client = TestClient(app)

    resp = client.post(
        "/api/v1/analyze",
        json={
            "report_id": 7,
            "public_id": "BEK-00007",
            "image_url": image_server,
            "latitude": 24.75,
            "longitude": 90.40,
            "description": "Pothole blocking the road",
        },
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "COMPLETED"
    assert body["report_id"] == 7
    assert body["public_id"] == "BEK-00007"
    assert body["classification"]["category_slug"] in {
        "road_damage",
        "drainage",
        "street_light",
        "garbage",
    }
    assert 0.0 <= body["classification"]["confidence"] <= 1.0
    assert body["severity_score"] is not None
    assert isinstance(body["embedding"], list)
    assert body["embedding_dim"] == 64
    assert body["processing_time_ms"] >= 0
    assert body["model_name"]


def test_analyze_returns_consistent_embedding_dimension(image_server):
    client = TestClient(app)

    resp = client.post(
        "/api/v1/analyze",
        json={"report_id": 1, "public_id": "BEK-00001", "image_url": image_server},
    )

    body = resp.json()
    assert len(body["embedding"]) == body["embedding_dim"] == 64
