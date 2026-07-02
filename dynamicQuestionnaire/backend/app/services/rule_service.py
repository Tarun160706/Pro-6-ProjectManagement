from datetime import datetime
from app.repositories.rule_repository import (RuleRepository)
from app.repositories.question_repository import (QuestionRepository)

class RuleService:
    @staticmethod
    def create_rule(
        question_id:str,
        option_id:str,
        next_question_id:str
    ):

        existing_rule = (
            RuleRepository
            .get_rule_by_question_and_option(
                question_id,
                option_id
            )
        )

        if existing_rule:

            raise Exception(
                "Rule already exists for this option"
            )

        rule = {
            "questionId": question_id,
            "optionId": option_id,
            "nextQuestionId": next_question_id,
            "isActive": True,
            "createdAt": datetime.utcnow()
        }

        result = RuleRepository.create(rule)

        return str(
            result.inserted_id
        )
        
    @staticmethod
    def get_all():
        rules=RuleRepository.get_all()

        for rule in rules:
            rule["_id"]=str(rule["_id"])
        return rules
    
    @staticmethod
    def delete_rule(rule_id:str):
        RuleRepository.delete(rule_id)

    @staticmethod
    def get_next_question(question_id:str, option_id:str):
        rule=RuleRepository.get_rule_by_question_and_option(question_id, option_id)

        if not rule:
            return None
        
        question=(QuestionRepository.get_by_id(rule["nextQuestionId"]))

        if not question:
            return None
        
        question["_id"]=str(question["_id"])

        return question