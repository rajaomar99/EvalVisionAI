"""OCR service - extract text from images and PDFs natively using Gemini vision."""

from __future__ import annotations
import io
from pathlib import Path
from google import genai
from PIL import Image
from app.core.config import settings

def _candidate_models() -> list[str]:
    models = [settings.gemini_model.strip()] if settings.gemini_model.strip() else []
    if settings.gemini_fallback_models.strip():
        for model in settings.gemini_fallback_models.split(","):
            m = model.strip()
            if m and m not in models:
                models.append(m)
    return models


def _format_gemini_error(exc: Exception) -> ValueError:
    message = str(exc)
    if "NOT_FOUND" in message or "404" in message:
        return ValueError("Gemini OCR model not found. Check your API version/key.")
    if "RESOURCE_EXHAUSTED" in message or "429" in message:
        return ValueError("Gemini quota exceeded (HTTP 429) during OCR.")
    return ValueError(f"Gemini OCR request failed: {message}")


def _pil_to_bytes(img: Image.Image, fmt: str = "PNG") -> bytes:
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


_OCR_SYSTEM = "You are an OCR assistant. Extract ALL text from the document exactly as written, preserving structure. Return ONLY the extracted text, no commentary."


async def _ocr_content(parts: list) -> str:
    """Send parts to Gemini for OCR extraction."""
    client = genai.Client(api_key=settings.gemini_api_key)
    parts.append("Extract all text from the document(s). Return only the raw text.")

    last_error: Exception | None = None

    for model in _candidate_models():
        try:
            response = await client.aio.models.generate_content(
                model=model,
                contents=parts,
                config=genai.types.GenerateContentConfig(
                    system_instruction=_OCR_SYSTEM,
                    max_output_tokens=8192,
                    temperature=0.0,
                ),
            )
            return (response.text or "").strip()
        except Exception as exc:
            last_error = exc
            continue

    if last_error:
        raise _format_gemini_error(last_error)
    raise ValueError("Gemini model configuration is empty.")


async def extract_text_from_image(image_path: str | Path) -> str:
    img = Image.open(image_path)
    img_bytes = _pil_to_bytes(img)
    parts = [genai.types.Part.from_bytes(data=img_bytes, mime_type="image/png")]
    return await _ocr_content(parts)


async def extract_text_from_pdf(pdf_path: str | Path) -> str:
    """Send PDF natively to Gemini."""
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()
    parts = [genai.types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf")]
    return await _ocr_content(parts)


async def extract_text_from_txt(txt_path: str | Path) -> str:
    with open(txt_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


async def extract_text_from_docx(docx_path: str | Path) -> str:
    from docx import Document
    doc = Document(docx_path)
    return "\n".join([p.text for p in doc.paragraphs])


async def extract_text(file_path: str | Path, mime_type: str) -> str:
    if mime_type == "application/pdf":
        return await extract_text_from_pdf(file_path)
    elif mime_type == "text/plain":
        return await extract_text_from_txt(file_path)
    elif mime_type in ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        return await extract_text_from_docx(file_path)
    return await extract_text_from_image(file_path)
