from pymongo import MongoClient
from app.core.config import settings

client = MongoClient(settings.MONGODB_URL)
database = client[settings.DATABASE_NAME]

Questionnaires_collection = database["questionnaires"]
questions_collection = database["questions"]
options_collection = database["options"]
rules_collection = database["rules"]
submissions_collection = database["submissions"]
