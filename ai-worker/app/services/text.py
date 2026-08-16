"""Text similarity helpers for duplicate detection."""

from __future__ import annotations

import re
from difflib import SequenceMatcher
from typing import Optional

_STOPWORDS = {
    "the", "a", "an", "of", "in", "on", "at", "to", "for", "and", "or",
    "is", "are", "was", "were", "be", "been", "this", "that", "with",
    "from", "by", "it", "er", "na", "amar", "tomar", "er", "shamne",
    "beshi", "bari", "acha", "ekhon",
}


def normalize(text: Optional[str]) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s\u0980-\u09ff]", " ", text)
    return " ".join(text.split())


def _tokens(text: str) -> set:
    return {t for t in normalize(text).split() if t not in _STOPWORDS}


def jaccard(a: Optional[str], b: Optional[str]) -> float:
    """Token Jaccard similarity in [0, 1]."""
    tokens_a = _tokens(a or "")
    tokens_b = _tokens(b or "")
    if not tokens_a or not tokens_b:
        return 0.0
    inter = len(tokens_a & tokens_b)
    union = len(tokens_a | tokens_b)
    return inter / union


def sequence(a: Optional[str], b: Optional[str]) -> float:
    """Character-level similarity for short, noisy descriptions."""
    return SequenceMatcher(None, a or "", b or "").ratio()


def text_similarity(a: Optional[str], b: Optional[str]) -> float:
    """Blend of token and character similarity."""
    if not a or not b:
        return 0.0
    return round(max(jaccard(a, b), sequence(a, b)), 4)
