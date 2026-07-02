from datetime import datetime
from app.repositories.submission_repository import (SubmissionRepository)

class  SubmissionService:
    @staticmethod
    def create_submission(
        questionnaire_id:str,
        user_id:str,
        answers:list
    ):
        submission={
            "questionnaireId":questionnaire_id,
            "userId":user_id,
            "answers":answers,
            "status":"COMPLETED",
            "submittedAt": datetime.utcnow()
        }
        result=(SubmissionRepository.create(submission))
        return str(result.inserted_id)
    
    @staticmethod
    def get_all():
        submissions=(SubmissionRepository.get_all())

        for submission in submissions:
            submission["_id"]=str(submission["_id"])

        return submissions