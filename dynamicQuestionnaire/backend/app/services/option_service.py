from datetime import datetime
from app.repositories.option_repository import (OptionRepository)

class OptionService:
    
    @staticmethod
    def create_option(
        question_id: str,
        option_text:str,
        diplay_order: int
    ):
        option={
            "questionId":question_id,
            "optionText":option_text,
            "displayOrder":diplay_order,
            "createdAt":datetime.utcnow()
        }
        result=OptionRepository.create(option)

        return str(result.inserted_id)
    
    @staticmethod
    def get_by_question_id(
        question_id: str
    ):

        options = (
            OptionRepository.get_by_question_id(
                question_id
            )
        )

        for option in options:
            option["_id"] = str(
                option["_id"]
            )

        return options

    @staticmethod
    def update_option(
        option_id: str,
        data: dict
    ):
        
        OptionRepository.update(
            option_id,
            data
        )

    @staticmethod
    def delete_option(
        option_id: str
    ):
        OptionRepository.delete(
            option_id
        )