from bson import ObjectId
from app.core.database import options_collection

class OptionRepository:
    @staticmethod
    def create(option: dict):
        return options_collection.insert_one(option)
    
    @staticmethod
    def get_by_id(option_id:str):
        return options_collection.find_one({"_id":ObjectId(option_id)})
    
    @staticmethod
    def get_by_question_id(question_id:str):
        return list(options_collection.find({"questionId":question_id}))
    
    @staticmethod
    def update(option_id:str, data:dict):
        return options_collection.update_one({"_id":ObjectId(option_id)}, {"$set":data})
    
    @staticmethod
    def delete(option_id:str):
        return options_collection.delete_one({"_id":ObjectId(option_id)})
    
    @staticmethod
    def delete_by_question_id(question_id: str):
        options_collection.delete_many({"questionId":question_id})

    @staticmethod
    def delete_by_question_ids(question_ids:list):
        options_collection.delete_many({"questionId": {"$in":question_ids}})