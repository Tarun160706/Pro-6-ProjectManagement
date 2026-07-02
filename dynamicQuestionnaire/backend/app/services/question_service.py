from datetime import datetime
from app.repositories.question_repository import (QuestionRepository)
from app.repositories.option_repository import OptionRepository
from app.repositories.rule_repository import RuleRepository
class QuestionService:
    @staticmethod
    def create_question(
        questionnaire_id:str,
        question_text:str,
        question_type:str,
        is_star_question:bool,
        platform:str,
        module:str,
        sub_module:str
    ):

        if is_star_question:

            existing_question = (
                QuestionRepository
                .get_start_question(
                    questionnaire_id
                )
            )

            if existing_question:

                raise Exception(
                    "Start question already exists"
                )

        question = {
            "questionnaireId":
                questionnaire_id,

            "questionText":
                question_text,

            "questionType":
                question_type,

            "isStarQuestion":
                is_star_question,

            "platform":
                platform,
            "module":
                module,
            "subModule":
                sub_module,

            "isActive":
                True,

            "createdAt":
                datetime.utcnow(),

            "updatedAt":
                datetime.utcnow()
        }

        result = (
            QuestionRepository
            .create(question)
        )

        return str(
            result.inserted_id
        )
    
    @staticmethod
    def get_all():
        questions=(QuestionRepository.get_all())

        for question in questions:
            question["_id"]=str(question["_id"])
        
        return questions
    
    @staticmethod
    def get_by_id(question_id:str):
        question=(QuestionRepository.get_by_id(question_id))

        if question:
            question["_id"]=str(question["_id"])

        return question
    
    @staticmethod
    def get_by_questionnaire_id(questionnaire_id:str):
        questions=(QuestionRepository.get_by_questionnaire_id(questionnaire_id))

        for question in questions:
            question["_id"]=str(question["_id"])
        
        return questions
    
    @staticmethod
    def update_question(question_id:str, data:dict):
        data["updatedAt"]:datetime.utcnow()
        QuestionRepository.update(question_id, data)


    @staticmethod
    def delete_question(question_id: str):
        
        OptionRepository.delete_by_question_id(question_id)
        
        RuleRepository.delete_by_question_id(question_id)
        
        QuestionRepository.delete(question_id)
        
        return True