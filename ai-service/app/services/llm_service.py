"""LLM service - build prompt, call Google Gemini, parse structured JSON."""

from __future__ import annotations
import json
import re
from google import genai
from app.core.config import settings
from app.models.schemas import Rubric

def _candidate_models() -> list[str]:
    """Return Gemini models to try in order (primary first, then fallbacks)."""
    models = [settings.gemini_model.strip()] if settings.gemini_model.strip() else []
    if settings.gemini_fallback_models.strip():
        for model in settings.gemini_fallback_models.split(","):
            m = model.strip()
            if m and m not in models:
                models.append(m)
    return models


def _format_gemini_error(exc: Exception) -> ValueError:
    """Normalize Gemini errors into user-friendly backend errors."""
    message = str(exc)
    if "NOT_FOUND" in message or "404" in message:
        return ValueError(
            "Gemini model not found for your API version/key. "
            "Use a currently available model such as gemini-flash-lite-latest or gemini-2.5-flash."
        )
    if "RESOURCE_EXHAUSTED" in message or "429" in message:
        return ValueError(
            "Gemini quota exceeded (HTTP 429). "
            "Your current key/project has no available free-tier quota for the configured model. "
            "Try a different model (e.g. gemini-1.5-flash), wait for quota reset, "
            "or use a key/project with enabled billing."
        )
    return ValueError(f"Gemini request failed: {message}")


# Prompt construction
def build_grading_prompt(
    submission_text: str,
    rubric: Rubric,
    assignment_title: str = "",
    course_name: str = "",
) -> str:
    """Return the grading prompt string."""

    criteria_block = "\n".join(
        f'  - id: "{c.id}", title: "{c.title}", '
        f'description: "{c.description}", maxScore: {c.maxScore}'
        for c in rubric.criteria
    )

    prompt = f"""You are an expert academic grader.

Assignment: {assignment_title or "N/A"}
Course: {course_name or "N/A"}

RUBRIC
------
{criteria_block}

STUDENT SUBMISSION
------------------
{submission_text}

INSTRUCTIONS
------------
1. Evaluate the submission against EACH rubric criterion.
2. Assign a score (0 to maxScore) for each criterion.
3. Provide concise, constructive feedback per criterion.
4. Write overall feedback summarising strengths and areas for improvement.
5. Calculate the totalScore as the SUM of all criterion scores.

Return your evaluation as **valid JSON only** (no markdown fences, no extra text):

{{
  "criteriaScores": [
    {{
      "criterionId": "<criterion id>",
      "score": <number>,
      "feedback": "<string>"
    }}
  ],
  "overallFeedback": "<string>",
  "totalScore": <number>
}}
"""
    return prompt.strip()


# Gemini client helper
def _get_client() -> genai.Client:
    """Return a configured Gemini client."""
    return genai.Client(api_key=settings.gemini_api_key)


# LLM call
async def call_llm(prompt: str) -> dict:
    """Call Google Gemini and return the parsed JSON dict."""
    client = _get_client()
    last_error: Exception | None = None

    for model in _candidate_models():
        try:
            response = await client.aio.models.generate_content(
                model=model,
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    system_instruction="You are an expert academic grader. Respond ONLY with valid JSON.",
                    max_output_tokens=settings.llm_max_tokens,
                    temperature=0.3,
                ),
            )
            raw = response.text or ""
            return _parse_json(raw)
        except Exception as exc:
            last_error = exc
            continue

    if last_error is not None:
        raise _format_gemini_error(last_error)
    raise ValueError("Gemini model configuration is empty.")


# JSON parsing helper
def _parse_json(text: str) -> dict:
    """Extract and parse JSON from an LLM response, stripping markdown fences."""
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ValueError(f"LLM returned invalid JSON: {exc}\n---\n{text}")
