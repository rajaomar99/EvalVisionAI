"""POST /ai/grade - accepts file upload or UploadThing URL for AI grading."""

from __future__ import annotations
import json
from pathlib import Path
from typing import Optional
import httpx
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from app.models.schemas import GradeResponse, GradeUrlRequest, Rubric
from app.services.grading_service import grade_submission
from app.utils.file_utils import cleanup, save_temp_file, validate_mime

router = APIRouter(prefix="/ai", tags=["grading"])

# Option A: file upload (multipart/form-data)
@router.post("/grade", response_model=GradeResponse)
async def grade_file(
    file: UploadFile = File(...),
    rubricFile: UploadFile = File(None),
    questions: str = Form(...),
    assignmentTitle: str = Form(""),
    courseName: str = Form(""),
) -> GradeResponse:
    """Grade a PDF or image submission via OCR + LLM (multipart upload)."""

    if not validate_mime(file.content_type or ""):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. "
                   "Allowed: PDF, DOCX, TXT, JPEG, PNG, WEBP.",
        )

    try:
        questions_list = json.loads(questions)
        from app.models.schemas import RubricCriterion
        criteria = [
            RubricCriterion(
                id=f"q{idx}",
                title=q.get("questionText", "")[:80],
                description=q.get("questionText", ""),
                maxScore=q.get("maxMarks", 0)
            ) for idx, q in enumerate(questions_list)
        ]
        rubric_obj = Rubric(title="Exam Rubric", criteria=criteria)
    except (json.JSONDecodeError, Exception) as exc:
        raise HTTPException(status_code=400, detail=f"Invalid questions JSON: {exc}")

    suffix = Path(file.filename or "upload").suffix
    tmp_path: Optional[Path] = None
    tmp_rubric_path: Optional[Path] = None

    try:
        contents = await file.read()
        tmp_path = save_temp_file(contents, suffix=suffix)

        if rubricFile and rubricFile.filename:
            rubric_contents = await rubricFile.read()
            tmp_rubric_path = save_temp_file(rubric_contents, suffix=Path(rubricFile.filename).suffix)

        from app.services.ocr_service import extract_text
        rubric_text = ""
        if tmp_rubric_path:
            rubric_text = await extract_text(tmp_rubric_path, rubricFile.content_type or "application/pdf")
            rubric_obj.title = f"Exam Rubric\n\nADDITIONAL RUBRIC DOCUMENT DETAILS:\n{rubric_text}"

        result = await grade_submission(
            rubric=rubric_obj,
            assignment_title=assignmentTitle,
            course_name=courseName,
            file_path=tmp_path,
            mime_type=file.content_type,
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Grading failed: {exc}")
    finally:
        if tmp_path:
            cleanup(tmp_path)
        if tmp_rubric_path:
            cleanup(tmp_rubric_path)


# Option B: UploadThing URL (JSON body)
@router.post("/grade/url", response_model=GradeResponse)
async def grade_url(body: GradeUrlRequest) -> GradeResponse:
    """
    Grade a submission by downloading its file from a cloud URL (e.g. UploadThing CDN).
    The rubric file is also downloaded by URL if provided.
    """
    tmp_path: Optional[Path] = None
    tmp_rubric_path: Optional[Path] = None

    try:
        from app.models.schemas import RubricCriterion
        criteria = [
            RubricCriterion(
                id=f"q{idx}",
                title=q.get("questionText", "")[:80],
                description=q.get("questionText", ""),
                maxScore=q.get("maxMarks", 0)
            ) for idx, q in enumerate(body.questions)
        ]
        rubric_obj = Rubric(title="Exam Rubric", criteria=criteria)

        # Download submission file from UploadThing CDN
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.get(body.fileUrl)
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=502,
                    detail=f"Failed to fetch submission file from URL (status {resp.status_code})"
                )
            suffix = Path(body.fileUrl.split("?")[0]).suffix or ".bin"
            tmp_path = save_temp_file(resp.content, suffix=suffix)

            # Download rubric file if provided
            if body.rubricFileUrl:
                rubric_resp = await client.get(body.rubricFileUrl)
                if rubric_resp.status_code == 200:
                    rubric_suffix = Path(body.rubricFileUrl.split("?")[0]).suffix or ".pdf"
                    tmp_rubric_path = save_temp_file(rubric_resp.content, suffix=rubric_suffix)

        # If rubric was downloaded, extract its text and append to rubric context
        if tmp_rubric_path:
            from app.services.ocr_service import extract_text
            rubric_text = await extract_text(
                tmp_rubric_path,
                "application/pdf"
            )
            if rubric_text:
                rubric_obj.title = f"Exam Rubric\n\nADDITIONAL RUBRIC DOCUMENT DETAILS:\n{rubric_text}"

        mime_type = body.mimeType or "application/octet-stream"
        if not validate_mime(mime_type):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {mime_type}"
            )

        result = await grade_submission(
            rubric=rubric_obj,
            assignment_title=body.assignmentTitle,
            course_name=body.courseName,
            file_path=tmp_path,
            mime_type=mime_type,
        )
        return result

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Grading failed: {exc}")
    finally:
        if tmp_path:
            cleanup(tmp_path)
        if tmp_rubric_path:
            cleanup(tmp_rubric_path)
