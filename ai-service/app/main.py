from fastapi import FastAPI, Depends
from app.api.routes.grade import router as grade_router
from app.core.config import settings
from app.core.security import verify_api_key

def normalize_prefix(prefix: str) -> str:
    if not prefix or prefix == "/":
        return ""

    trimmed = prefix.rstrip("/")
    return trimmed if trimmed.startswith("/") else f"/{trimmed}"

app = FastAPI(
    title="EvalVision AI Service",
    version="0.1.0",
    description="AI microservice for rubric-based grading.",
)

_prefix = normalize_prefix(settings.api_prefix)

app.include_router(
    grade_router, 
    prefix=_prefix,
    dependencies=[Depends(verify_api_key)]
)
