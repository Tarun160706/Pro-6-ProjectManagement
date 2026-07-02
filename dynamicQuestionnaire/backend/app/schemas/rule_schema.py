from pydantic import BaseModel

class RuleCreatedRequest(BaseModel):
    questionId:str
    optionId:str
    nextQuestionId:str

class NextQuestionRequest(BaseModel):
    questionId:str
    selectedOptionId:str