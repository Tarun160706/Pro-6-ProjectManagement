from fastapi import FastAPI
from app.core.database import database
from app.routers.questionnaire import router as questionnaire_router
from app.routers.question import router as question_router
from app.routers.option import router as option_router
from app.routers.submission import router as submission_router
from app.routers.rule import router as rule_router
from app.routers.engine import router as engine_router
from app.routers.status import router as status_router

app = FastAPI(
    title="Dynamic Questionnaire System",
    version="1.0.0"
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5177",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(questionnaire_router, prefix="/api/v1")
app.include_router(question_router, prefix="/api/v1")
app.include_router(option_router, prefix="/api/v1")
app.include_router(submission_router, prefix="/api/v1")
app.include_router(rule_router, prefix="/api/v1")
app.include_router(engine_router, prefix="/api/v1")
app.include_router(status_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
def health_check() -> dict:
    return {"status": "UP"}


@app.get("/health/db", tags=["Health"])
def database_health_check() -> dict:
    try:
        database.command("ping")
        return {
            "status": "UP",
            "database": "CONNECTED"
        }
    except Exception as e:
        return {
            "status": "DOWN",
            "database": "DISCONNECTED",
            "error": str(e)
        }
