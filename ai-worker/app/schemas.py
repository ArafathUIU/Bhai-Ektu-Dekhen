"""Pydantic request/response schemas for the AI worker."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    """Payload sent by Laravel for a single report image."""

    report_id: int
    public_id: str
    image_url: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None


class ClassificationResult(BaseModel):
    category_slug: str
    category_name: str
    confidence: float = Field(ge=0.0, le=1.0)


class AnalyzeResponse(BaseModel):
    """AI inference result for one report."""

    report_id: int
    public_id: str
    status: str
    classification: Optional[ClassificationResult] = None
    severity_score: Optional[float] = None
    embedding: Optional[list[float]] = None
    embedding_dim: Optional[int] = None
    processing_time_ms: Optional[int] = None
    model_name: str
    model_version: str
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
