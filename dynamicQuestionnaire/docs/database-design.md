#Users:
{
  "_id": "",
  "name": "",
  "email": "",
  "password":"",
  "role": "ADMIN | USER",
  "isActive":"",
  "createdAt":"",
  "updatedAt":""
}

#Questionnaires
{
    "_id":"",
    "title":"",
    "description":"",
    "status":"",
    "createdBy":"",
    "createdAt":"",
    "updatedAt":""
}

#Questions
{
    "_id":"",
    "questionnaireId":"",
    "question":"",
    "questionType":"",
    "isStartQuestion":"",
    "isActive": true | false,
    "createdAt":""
}

#Options (only for choise based questions)
{
    "_id":"",
    "questionId":"",
    "text":"",
    "displayOrder":1
}

#Rules:
{
    "_id": "",
    "questionnaireId":"",
    "questionId":"",
    "conditionType":"OPTION_EQUALS/TEXT_EQUALS/NUMBER_EQUALS/GREATER_THAN/LESS_THAN/GREATER_THAN_OR_EQUAL/LESS_THAN_OR_EQUAL",
    "conditionValue":"",
    "nextQuestionId":"",
    "isActive":true | false
}

#Response:
{
    "_id":"",
    "questionnaireId":"",
    "userId":"",
    "status":"",
    "submittedAt":"",
    "answers": [
        {
            "questionId":"",
            "answer":""
        }
    ]
}