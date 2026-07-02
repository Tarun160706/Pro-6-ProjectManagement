from fastapi import (APIRouter, HTTPException)
from app.schemas.rule_schema import (RuleCreatedRequest)
from app.services.rule_service import RuleService

router = APIRouter(
    prefix="/rules",
    tags=["Rules"]
)


@router.post("")
def create_rule(
    request: RuleCreatedRequest
):
    try:

        rule_id = (
            RuleService.create_rule(
                request.questionId,
                request.optionId,
                request.nextQuestionId
            )
        )

        return {
            "ruleId": rule_id
        }

    except Exception as exception:

        raise HTTPException(
            status_code=400,
            detail=str(exception)
        )


@router.get("")
def get_rules():
    return RuleService.get_all()


@router.delete("/{rule_id}")
def delete_rule(rule_id: str):
    RuleService.delete_rule(rule_id)
    return {"message": "Rule Deleted"}
