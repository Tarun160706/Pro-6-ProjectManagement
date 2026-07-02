from pydantic import BaseModel
from typing import Optional


class QuestionnaireCreateRequest(
    BaseModel
):
    title: str
    description: Optional[str] = None


class QuestionnaireUpdateRequest(
    BaseModel
):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class QuestionnaireResponse(
    BaseModel
):
    id: str
    title: str
    description: Optional[str]
    status: str