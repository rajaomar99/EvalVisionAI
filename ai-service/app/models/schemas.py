"""Pydantic schemas for the grading pipeline."""

from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field

# Rubric
class RubricCriterion(BaseModel):
    id: str = Field(..., description="Unique criterion identifier, e.g. 'crit1'")
    title: str
    description: str = ""
    maxScore: float = Field(..., gt=0)


class Rubric(BaseModel):
    title: str = "Rubric"
    criteria: list[RubricCriterion] = Field(..., min_length=1)


# Grade request (JSON body - URL-based)
class GradeUrlRequest(BaseModel):
    fileUrl: str = Field(..., min_length=1)
    mimeType: str = ""
    rubricFileUrl: str = ""
    questions: list[dict] = Field(..., min_length=1)
    assignmentTitle: str = ""
    courseName: str = ""


# LLM / evaluation response
class CriterionScore(BaseModel):
    criterionId: str
    score: float
    feedback: str = ""


class Evaluation(BaseModel):
    criteriaScores: list[CriterionScore]
    overallFeedback: str = ""
    totalScore: float = 0


class GradeResponse(BaseModel):
    success: bool = True
    extractedText: Optional[str] = None
    evaluation: Evaluation
