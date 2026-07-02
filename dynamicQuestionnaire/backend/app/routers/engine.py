from fastapi import (APIRouter, HTTPException)
from app.schemas.rule_schema import (NextQuestionRequest)
from app.services.rule_service import (RuleService)

router=APIRouter(
    prefix="/engine",
    tags=["Rule Engine"]
)

@router.post("/next-question")
def get_next_question(request: NextQuestionRequest):
    question=(RuleService.get_next_question(
        request.questionId,
        request.selectedOptionId
    ))

    if not question:
        raise HTTPException(
            status_code=404,
            detail="no next question found"
        )
    return question