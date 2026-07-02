from bson import ObjectId
from app.core.database import Questionnaires_collection


class QuestionnaireRepository:

    @staticmethod
    def create(questionnaire: dict):
        return Questionnaires_collection.insert_one(
            questionnaire
        )

    @staticmethod
    def get_all():
        return list(
            Questionnaires_collection.find()
        )

    @staticmethod
    def get_published():
        return list(
            Questionnaires_collection.find(
                {
                    "status": "PUBLISHED"
                }
            )
        )

    @staticmethod
    def get_by_id(questionnaire_id: str):
        return Questionnaires_collection.find_one(
            {
                "_id":
                    ObjectId(
                        questionnaire_id
                    )
            }
        )

    @staticmethod
    def update(
        questionnaire_id: str,
        data: dict
    ):
        return (
            Questionnaires_collection.update_one(
                {
                    "_id":
                        ObjectId(
                            questionnaire_id
                        )
                },
                {
                    "$set": data
                }
            )
        )

    @staticmethod
    def delete(
        questionnaire_id: str
    ):
        return (
            Questionnaires_collection.delete_one(
                {
                    "_id":
                        ObjectId(
                            questionnaire_id
                        )
                }
            )
        )