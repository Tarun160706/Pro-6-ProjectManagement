# Authentication

## Login

`POST /api/v1/auth/login`

### Request
```json
{
  "email": "",
  "password": ""
}
```

### Response
```json
{
  "accessToken": "",
  "role": ""
}
```

---

# Questionnaire APIs

## Create Questionnaire

`POST /api/v1/questionnaires`

### Request
```json
{
  "title": "",
  "description": ""
}
```

---

## Get All Questionnaires

`GET /api/v1/questionnaires`

---

## Get Questionnaire by ID

`GET /api/v1/qestionnaires/{questionnaireID}`

---

# Question APIs

## Create Question

`POST /api/v1/questions`

### Request
```json
{
  "questionnaireID": "",
  "questionText": "",
  "questionType": "",
  "isStartQuestion": ""
}
```

---

## Get Questions

`GET /api/v1/questions`

---

## Update Questions

`PUT /api/v1/questions/{questionId}`

---

## Delete Question

`DELETE /api/v1/questions/{questionsId}`

---

# Option APIs

## Create Option

`POST /api/v1/options`

### Request
```json
{
  "questionId": "",
  "optionText": ""
}
```

---

## Get Options

`GET /api/v1/questions/{questionId}/options`

---

# Rule APIs

## Create Rule

`POST /api/v1/rules`

### Request
```json
{
  "questionID": "",
  "conditionType": "",
  "conditionValue": "",
  "nextQuestionId": ""
}
```

---

## Get Rules

`GET /api/v1/rules`

---

## Update Rule

`PUT /api/v1/rules/{ruleId}`

---

# User Flow APIs

## Start Questionnaire

`GET /api/v1/questionnaires/{questionnaireId}/start`

### Response
```json
{
  "questionId": "",
  "questionText": ""
}
```

---

## Submit Answer

`POST /api/v1/questionnaires/answer`

### Request
```json
{
  "submittedId": "",
  "questionId": "",
  "answer": ""
}
```

### Response
```json
{
  "nextQuestionId": "",
  "questionText": ""
}
```

---

## Complete Questionnaire

`POST /api/v1/questionnaire/submit`