from bson import ObjectId
from app.core.database import questions_collection

class QuestionRepository:

    @staticmethod
    def create(question: dict):
        return questions_collection.insert_one(question)
    
    @staticmethod
    def get_all():
        return list(questions_collection.find())
    
    @staticmethod
    def get_by_id(question_id: str):
        return questions_collection.find_one({"_id":ObjectId(question_id)})
    
    @staticmethod
    def get_by_questionnaire_id(questionnaire_id:str):
        return list(questions_collection.find({"questionnaireId":questionnaire_id}))
    
    @staticmethod
    def update(question_id:str, data: dict):
        return questions_collection.update_one({"_id":ObjectId(question_id)}, {"$set": data})
    
    @staticmethod
    def delete(question_id:str):
        return questions_collection.delete_one({"_id":ObjectId(question_id)})
    
    @staticmethod
    def get_start_question(
        questionnaire_id: str
    ):
        return questions_collection.find_one(
            {
                "questionnaireId":
                    questionnaire_id,

                "isStarQuestion":
                    {
                        "$in": [
                            True,
                            "True"
                        ]
                    }
            }
        )
    
    @staticmethod
    def delete_by_questionnaire_id(questionnaire_id: str):
        questions_collection.delete_many({"questionnaireId": questionnaire_id})