from pydantic import BaseModel, Field
from typing import Optional
from app.enum.question_type import (QuestionType)

class QuestionCreateRequest(BaseModel):
    questionnaireId:str
    questionText:str
    questionType:QuestionType
    isStarQuestion:bool=Field(default=False, alias="isStarQuestion")

    platform: Optional[str]=""
    module: Optional[str]=""
    subModule: Optional[str]=""

    class Config:
        populated_by_name=True

class QuestionUpdateRequest(BaseModel):
    questionText: Optional[str]=None
    questionType: Optional[str]=None
    isStarQuestion: Optional[str]=None
    isActive: Optional[str]=None

    platform: Optional[str]=None
    module: Optional[str]=None
    subModule: Optional[str]=None