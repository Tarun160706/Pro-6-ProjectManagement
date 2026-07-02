from fastapi import APIRouter, HTTPException
from app.core.database import submissions_collection

router = APIRouter(
    prefix="/questionnaires",
    tags=["Questionnaire Status"]
)


@router.get("/status/{questionnaire_id}")
def get_questionnaire_status(questionnaire_id: str):
    """Get the answer status for a questionnaire - whether it has been answered and how many submissions."""
    try:
        submission_count = submissions_collection.count_documents(
            {"questionnaireId": questionnaire_id}
        )

        return {
            "questionnaireId": questionnaire_id,
            "submissionCount": submission_count,
            "isAnswered": submission_count > 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/status")
def get_all_questionnaires_status():
    """Get answer status for all questionnaires that have submissions."""
    try:
        pipeline = [
            {"$group": {
                "_id": "$questionnaireId",
                "submissionCount": {"$sum": 1}
            }}
        ]
        results = list(submissions_collection.aggregate(pipeline))

        status_map = {}
        for r in results:
            status_map[str(r["_id"])] = {
                "questionnaireId": str(r["_id"]),
                "submissionCount": r["submissionCount"],
                "isAnswered": r["submissionCount"] > 0
            }

        return status_map
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
