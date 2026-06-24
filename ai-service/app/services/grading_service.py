"""Grading service - orchestrates OCR -> LLM -> validation pipeline."""

from __future__ import annotations
from pathlib import Path
from typing import Optional
from app.models.schemas import (
    CriterionScore,
    Evaluation,
    GradeResponse,
    Rubric,
)
from app.services.llm_service import build_grading_prompt, call_llm
from app.services.ocr_service import extract_text

async def grade_submission(
    rubric: Rubric,
    assignment_title: str = "",
    course_name: str = "",
    *,
    submission_text: Optional[str] = None,
    file_path: Optional[Path] = None,
    mime_type: Optional[str] = None,
) -> GradeResponse:
    """
    Full grading pipeline.

    Either ``submission_text`` or ``file_path``+``mime_type`` must be provided.
    If a file is given, OCR is performed first.
    """

    extracted: Optional[str] = None

    # 1. OCR
    if file_path and mime_type:
        extracted = await extract_text(file_path, mime_type)
        text_for_llm = extracted
    elif submission_text:
        text_for_llm = submission_text
    else:
        raise ValueError("Either submission_text or a file must be provided")

    # 2. Build prompt & call LLM
    prompt = build_grading_prompt(
        submission_text=text_for_llm,
        rubric=rubric,
        assignment_title=assignment_title,
        course_name=course_name,
    )
    raw_eval = await call_llm(prompt)

    # 3. Parse & validate scores
    criteria_map = {c.id: c.maxScore for c in rubric.criteria}
    criteria_scores: list[CriterionScore] = []
    total = 0.0

    for item in raw_eval.get("criteriaScores", []):
        cid = item.get("criterionId", "")
        score = float(item.get("score", 0))
        feedback = item.get("feedback", "")

        # Clamp score to [0, maxScore]
        max_score = criteria_map.get(cid)
        if max_score is not None:
            score = max(0, min(score, max_score))

        total += score
        criteria_scores.append(
            CriterionScore(criterionId=cid, score=score, feedback=feedback)
        )

    # Ensure every criterion is present (fill missing with 0).
    graded_ids = {cs.criterionId for cs in criteria_scores}
    for cid in criteria_map:
        if cid not in graded_ids:
            criteria_scores.append(
                CriterionScore(
                    criterionId=cid,
                    score=0,
                    feedback="Not evaluated by AI - please review manually.",
                )
            )

    evaluation = Evaluation(
        criteriaScores=criteria_scores,
        overallFeedback=raw_eval.get("overallFeedback", ""),
        totalScore=total,
    )

    return GradeResponse(
        success=True,
        extractedText=extracted,
        evaluation=evaluation,
    )
