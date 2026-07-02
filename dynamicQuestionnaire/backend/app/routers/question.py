from fastapi import (APIRouter, HTTPException)
from app.schemas.question_schema import (QuestionCreateRequest, QuestionUpdateRequest)
from app.services.question_service import (QuestionService)

router = APIRouter(
    prefix="/questions",
    tags=["Questions"]
)


@router.post("")
def create_question(
    request: QuestionCreateRequest
):

    try:

        question_id = (
            QuestionService.create_question(
                request.questionnaireId,
                request.questionText,
                request.questionType,
                request.isStarQuestion,
                request.platform,
                request.module,
                request.subModule
            )
        )

        return {
            "questionId":
                question_id
        }

    except Exception as exception:

        raise HTTPException(
            status_code=400,
            detail=str(exception)
        )


@router.get("")
def get_questions():
    return QuestionService.get_all()


@router.get("/{question_id}")
def get_question(question_id: str):
    question = QuestionService.get_by_id(question_id)

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )
    return question


@router.get("/questionnaire/{questionnaire_id}")
def get_questionnire_questions(questionnaire_id: str):
    return QuestionService.get_by_questionnaire_id(questionnaire_id)


@router.put("/{question_id}")
def update_question(question_id: str, request: QuestionUpdateRequest):
    QuestionService.update_question(question_id, request.model_dump(exclude_none=True))
    return {"message": "Question updated"}


@router.delete("/{question_id}")
def delete_question(question_id: str):
    QuestionService.delete_question(question_id)
    return {"message": "Question deleted"}
