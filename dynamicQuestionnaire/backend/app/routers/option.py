from fastapi import APIRouter
from app.schemas.option_schema import (OptionCreateRequest, OptionUpdateRequest)
from app.services.option_service import (
    OptionService
)

router = APIRouter(
    prefix="/options",
    tags=["Options"]
)


@router.post("")
def create_option(
    request: OptionCreateRequest
):

    option_id = (
        OptionService.create_option(
            request.questionId,
            request.optionText,
            request.displayOrder
        )
    )

    return {
        "optionId": option_id
    }


@router.get("/question/{question_id}")
def get_options(
    question_id: str
):

    return (
        OptionService.get_by_question_id(
            question_id
        )
    )


@router.put("/{option_id}")
def update_option(
    option_id: str,
    request: OptionUpdateRequest
):

    OptionService.update_option(
        option_id,
        request.model_dump(
            exclude_none=True
        )
    )

    return {
        "message": "Option updated"
    }


@router.delete("/{option_id}")
def delete_option(
    option_id: str
):

    OptionService.delete_option(
        option_id
    )

    return {
        "message": "Option deleted"
    }
