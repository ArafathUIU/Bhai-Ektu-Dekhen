"""Image classification service.

In V1 this uses a lightweight heuristic classifier based on low-level image
statistics. The interface is intentionally isolated so a real PyTorch / ONNX
model (e.g. ResNet fine-tuned on the four civic categories) can be dropped in
without touching the API layer.
"""

from __future__ import annotations

from typing import Optional

from PIL import Image

# Matches the `issue_categories` seeder in Laravel.
CATEGORIES = [
    {"slug": "road_damage", "name": "Road Damage"},
    {"slug": "drainage", "name": "Drainage"},
    {"slug": "street_light", "name": "Street Light"},
    {"slug": "garbage", "name": "Garbage"},
]


class ImageClassifier:
    """Heuristic classifier over image statistics.

    The heuristic scores each category from simple cues: dominant darkness
    (potholes), water presence / blue tones (drainage), bright circular blobs
    (street lights), and high-frequency clutter + litter tones (garbage).
    """

    def __init__(self) -> None:
        self._model_name = "civic-vision-heuristic-v1"

    @property
    def model_name(self) -> str:
        return self._model_name

    def predict(self, image: Image.Image) -> dict:
        stats = self._extract_stats(image)

        scores = {
            "road_damage": self._score_road(stats),
            "drainage": self._score_drainage(stats),
            "street_light": self._score_street_light(stats),
            "garbage": self._score_garbage(stats),
        }

        best_slug = max(scores, key=scores.get)
        best_score = scores[best_slug]

        best = next(c for c in CATEGORIES if c["slug"] == best_slug)

        return {
            "category_slug": best_slug,
            "category_name": best["name"],
            "confidence": round(float(best_score), 4),
            "scores": {k: round(float(v), 4) for k, v in scores.items()},
        }

    def _extract_stats(self, image: Image.Image) -> dict:
        rgb = image.convert("RGB")
        small = rgb.resize((64, 64))

        # Overall mean brightness and standard deviation.
        pixels = list(small.getdata())
        n = len(pixels)
        mean_r = sum(p[0] for p in pixels) / n
        mean_g = sum(p[1] for p in pixels) / n
        mean_b = sum(p[2] for p in pixels) / n
        brightness = (mean_r + mean_g + mean_b) / 3.0

        # Fraction of very dark pixels (candidates for potholes).
        dark = sum(1 for p in pixels if sum(p[:3]) / 3.0 < 60) / n

        # Fraction of blue-ish pixels (water / flooding).
        blue = sum(
            1 for p in pixels if p[2] > p[0] + 25 and p[2] > p[1] + 15
        ) / n

        # Fraction of very bright pixels (light sources at night).
        bright = sum(1 for p in pixels if sum(p[:3]) / 3.0 > 230) / n

        # Edge density as a proxy for clutter / uneven terrain.
        gray = small.convert("L")
        edge_density = self._edge_density(gray)

        return {
            "brightness": brightness,
            "dark": dark,
            "blue": blue,
            "bright": bright,
            "edges": edge_density,
        }

    @staticmethod
    def _edge_density(gray: Image.Image) -> float:
        """Fraction of pixels that differ strongly from the pixel below."""

        width, height = gray.size
        px = gray.load()
        strong = 0
        total = 0
        for y in range(height - 1):
            for x in range(width):
                diff = abs(px[x, y] - px[x, y + 1])
                if diff > 40:
                    strong += 1
                total += 1
        return strong / max(total, 1)

    @staticmethod
    def _score_road(stats: dict) -> float:
        return min(1.0, stats["dark"] * 1.6 + stats["edges"] * 0.5)

    @staticmethod
    def _score_drainage(stats: dict) -> float:
        return min(1.0, stats["blue"] * 2.2 + stats["dark"] * 0.4)

    @staticmethod
    def _score_street_light(stats: dict) -> float:
        return min(1.0, stats["bright"] * 2.4 + stats["dark"] * 0.6)

    @staticmethod
    def _score_garbage(stats: dict) -> float:
        return min(1.0, stats["edges"] * 1.4 + (1.0 - stats["brightness"] / 255) * 0.6)


def load_classifier() -> Optional[ImageClassifier]:
    """Factory kept separate so model loading can become lazy/async later."""
    return ImageClassifier()
