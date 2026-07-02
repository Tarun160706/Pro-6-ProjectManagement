from fastapi import APIRouter

from app.schemas.submission_schema import (
    SubmissionCreateRequest
)

from app.services.submission_service import (
    SubmissionService
)


router = APIRouter(
    prefix="/submissions",
    tags=["Submissions"]
)


@router.post("")
def create_submission(
    request: SubmissionCreateRequest
):

    submission_id = (
        SubmissionService.create_submission(
            request.questionnaireId,
            request.userId,
            [
                answer.model_dump()
                for answer in request.answers
            ]
        )
    )

    return {
        "submissionId": submission_id
    }


@router.get("")
def get_submissions():

    return (
        SubmissionService.get_all()
    )