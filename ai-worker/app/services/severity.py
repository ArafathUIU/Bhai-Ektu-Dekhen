"""Severity scoring service.

Combines visual cues from the classification stage into a 0..1 severity score.
The Laravel side later blends this with community and geospatial signals
(per the architecture's "Severity Score" section).
"""

from __future__ import annotations

from typing import Optional


class SeverityScorer:
    """Rule-based severity estimate from classification statistics."""

    def __init__(self) -> None:
        self._model_name = "civic-severity-rules-v1"

    @property
    def model_name(self) -> str:
        return self._model_name

    def score(self, classification: dict) -> float:
        scores = classification.get("scores", {})
        if not scores:
            return 0.5

        # Higher confidence in the predicted category adds weight.
        base = 0.4 + (classification.get("confidence", 0.0) * 0.3)

        # Certain categories are inherently more hazardous.
        hazard_weights = {
            "road_damage": 0.15,
            "drainage": 0.20,
            "street_light": 0.05,
            "garbage": 0.10,
        }
        category = classification.get("category_slug", "")
        base += hazard_weights.get(category, 0.1)

        # Ambiguity between the top-2 categories lowers severity.
        ordered = sorted(scores.values(), reverse=True)
        if len(ordered) >= 2:
            margin = ordered[0] - ordered[1]
            base += max(0.0, min(0.15, margin))

        return round(min(1.0, max(0.0, base)), 4)


def load_scorer() -> Optional[SeverityScorer]:
    return SeverityScorer()
