from pydantic import BaseModel
from typing import Optional

class OptionCreateRequest(BaseModel):
    questionId: str
    optionText: str
    displayOrder: int=1

class OptionUpdateRequest(BaseModel):
    optionText: Optional[str]=None
    displayOrder: Optional[str]=None