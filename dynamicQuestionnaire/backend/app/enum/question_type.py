from enum import Enum

class QuestionType(str, Enum):
    SINGLE_CHOISE="SINGLE_CHOISE"
    TEXT="TEXT"
    NUMBER="NUMBER"
    COMPLEXITY="COMPLEXITY"