from datetime import datetime

from app.repositories.questionnaire_repository import (
    QuestionnaireRepository
)
from app.repositories.question_repository import QuestionRepository
from app.repositories.option_repository import OptionRepository
from app.repositories.rule_repository import RuleRepository
from app.repositories.submission_repository import SubmissionRepository


class QuestionnaireService:

    @staticmethod
    def create_questionnaire(
        title: str,
        description: str,
        created_by: str
    ):

        questionnaire = {

            "title":
                title,

            "description":
                description,

            "status":
                "DRAFT",

            "createdBy":
                created_by,

            "createdAt":
                datetime.utcnow(),

            "updatedAt":
                datetime.utcnow()
        }

        result = (
            QuestionnaireRepository.create(
                questionnaire
            )
        )

        return str(
            result.inserted_id
        )

    @staticmethod
    def get_all():

        questionnaires = (
            QuestionnaireRepository.get_all()
        )

        for questionnaire in questionnaires:

            questionnaire["_id"] = str(
                questionnaire["_id"]
            )

        return questionnaires

    @staticmethod
    def get_published():

        questionnaires = (
            QuestionnaireRepository.get_published()
        )

        for questionnaire in questionnaires:

            questionnaire["_id"] = str(
                questionnaire["_id"]
            )

        return questionnaires

    @staticmethod
    def get_by_id(
        questionnaire_id: str
    ):

        questionnaire = (
            QuestionnaireRepository.get_by_id(
                questionnaire_id
            )
        )

        if questionnaire:

            questionnaire["_id"] = str(
                questionnaire["_id"]
            )

        return questionnaire

    @staticmethod
    def update_questionnaire(
        questionnaire_id: str,
        data: dict
    ):

        data["updatedAt"] = (
            datetime.utcnow()
        )

        QuestionnaireRepository.update(
            questionnaire_id,
            data
        )

    @staticmethod
    def delete_questionnaire(questionnaire_id: str):
        try:
            print(f"--- 1. STARTING CASCADE DELETE FOR Q_ID: {questionnaire_id} ---")

            # Fetch questions
            questions = QuestionRepository.get_by_questionnaire_id(questionnaire_id)
            print(f"--- 2. Found {len(questions)} questions linked to this questionnaire.")

            # Safely extract IDs whether PyMongo returned dictionaries or Pydantic models
            question_ids = []
            for q in questions:
                if isinstance(q, dict):
                    q_id = q.get("_id") or q.get("id")
                else:
                    q_id = getattr(q, "id", None) or getattr(q, "_id", None)
                
                if q_id:
                    question_ids.append(str(q_id))

            print(f"--- 3. Extracted Question IDs: {question_ids}")

            if question_ids:
                print("--- 4. Deleting associated Options...")
                OptionRepository.delete_by_question_ids(question_ids)
                
                print("--- 5. Deleting associated Rules...")
                RuleRepository.delete_by_question_ids(question_ids) # Watch the spelling!

            print("--- 6. Deleting associated Submissions...")
            SubmissionRepository.delete_by_questionnaire_id(questionnaire_id)

            print("--- 7. Deleting Questions...")
            QuestionRepository.delete_by_questionnaire_id(questionnaire_id)

            print("--- 8. Deleting Questionnaire itself...")
            # Ensure you are calling your actual questionnaire repo method here!
            QuestionnaireRepository.delete(questionnaire_id) 

            print("--- 9. CASCADE DELETE COMPLETE! ---")
            return True

        except Exception as e:
            print(f"CASCADE DELETE CRASHED: {str(e)}")
            raise e

    @staticmethod
    def publish_questionnaire(
        questionnaire_id: str
    ):

        QuestionnaireRepository.update(
            questionnaire_id,
            {
                "status":
                    "PUBLISHED",

                "updatedAt":
                    datetime.utcnow()
            }
        )