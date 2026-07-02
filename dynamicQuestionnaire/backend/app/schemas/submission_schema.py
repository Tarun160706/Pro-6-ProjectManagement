from pydantic import BaseModel
from typing import Any, List, Optional

class AnswerRequest(BaseModel):
    questionId:str
    answer: Any

    platform: Optional[str]=""
    module: Optional[str]=""
    subModule: Optional[str]=""
    hours: Optional[float]=""

class SubmissionCreateRequest(BaseModel):
    questionnaireId:str
    userId: Optional[str] = "anonymous"
    answers: List[AnswerRequest]