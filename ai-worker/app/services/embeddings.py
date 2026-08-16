"""Image embedding service.

Produces a compact, comparable vector for an image. V1 uses a perceptual-hash
style vector built from the discrete cosine transform of a grayscale thumbnail,
which is lightweight and robust to small geometric changes. A real CNN
embedding (e.g. a MobileNet feature vector) can replace this later.
"""

from __future__ import annotations

from typing import Optional

import numpy as np
from PIL import Image


class ImageEmbedder:
    """DCT-based perceptual embedding (64-dim vector)."""

    DIM = 64

    def __init__(self) -> None:
        self._model_name = "civic-embed-dct-v1"

    @property
    def model_name(self) -> str:
        return self._model_name

    def embed(self, image: Image.Image) -> np.ndarray:
        gray = image.convert("L").resize((64, 64))
        matrix = np.asarray(gray, dtype=np.float32)
        dct = self._dct2(matrix).flatten()
        # Skip the DC coefficient; keep the next DIM low-frequency coefficients.
        low = dct[1 : self.DIM + 1]
        norm = np.linalg.norm(low)
        if norm == 0:
            return np.zeros(self.DIM, dtype=np.float32)
        return (low / norm).astype(np.float32)

    @staticmethod
    def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
        if a.size != b.size:
            return 0.0
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(a, b) / (norm_a * norm_b))

    @staticmethod
    def _dct2(matrix: np.ndarray) -> np.ndarray:
        """2D DCT via separable 1D DCT (Type-II)."""

        def _dct1d(x: np.ndarray) -> np.ndarray:
            n = x.shape[0]
            k = np.arange(n)[:, None]
            n_idx = np.arange(n)[None, :]
            basis = np.cos(np.pi * k * (2 * n_idx + 1) / (2 * n))
            scale = np.full((n, 1), np.sqrt(2.0 / n))
            scale[0] = np.sqrt(1.0 / n)
            return scale * basis @ x

        rows = np.apply_along_axis(_dct1d, 1, matrix)
        cols = np.apply_along_axis(_dct1d, 0, rows)
        return cols


def load_embedder() -> Optional[ImageEmbedder]:
    return ImageEmbedder()
