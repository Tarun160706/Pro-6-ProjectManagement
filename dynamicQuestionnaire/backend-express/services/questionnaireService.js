const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { loadData, saveData } = require('./dataStore');

class QuestionnaireService {
  static createQuestionnaire(title, description, createdBy = 'ADMIN') {
    const data = loadData();
    const questionnaire = {
      _id: crypto.randomUUID(),
      title,
      description: description || '',
      status: 'DRAFT',
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.questionnaires.push(questionnaire);
    saveData(data);
    return questionnaire._id;
  }

  static getAll() {
    const data = loadData();
    return data.questionnaires.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static getPublished() {
    const data = loadData();
    return data.questionnaires
      .filter(q => q.status === 'PUBLISHED')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static getById(questionnaireId) {
    const data = loadData();
    return data.questionnaires.find(q => q._id === questionnaireId) || null;
  }

  static updateQuestionnaire(questionnaireId, dataToUpdate) {
    const data = loadData();
    const index = data.questionnaires.findIndex(q => q._id === questionnaireId);
    if (index !== -1) {
      data.questionnaires[index] = {
        ...data.questionnaires[index],
        ...dataToUpdate,
        updatedAt: new Date().toISOString()
      };
      saveData(data);
      return true;
    }
    return false;
  }

  static deleteQuestionnaire(questionnaireId) {
    const data = loadData();

    // Find questions linked to this questionnaire
    const questions = data.questions.filter(q => q.questionnaireId === questionnaireId);
    const questionIds = questions.map(q => q._id);

    // Cascade delete: options, rules, questions, submissions
    if (questionIds.length > 0) {
      data.options = data.options.filter(o => !questionIds.includes(o.questionId));
      data.rules = data.rules.filter(r => !questionIds.includes(r.questionId));
      data.questions = data.questions.filter(q => !questionIds.includes(q._id));
    }

    data.submissions = data.submissions.filter(s => s.questionnaireId !== questionnaireId);
    data.questionnaires = data.questionnaires.filter(q => q._id !== questionnaireId);

    saveData(data);
    return true;
  }

  static publishQuestionnaire(questionnaireId) {
    return QuestionnaireService.updateQuestionnaire(questionnaireId, { status: 'PUBLISHED' });
  }

  static cloneQuestionnaire(sourceQuestionnaireId, newTitle, newDescription = '') {
    const data = loadData();
    const sourceQ = data.questionnaires.find(q => q._id === sourceQuestionnaireId);
    if (!sourceQ) {
      throw new Error('Source questionnaire not found');
    }

    const newQuestionnaireId = crypto.randomUUID();
    const newQuestionnaire = {
      _id: newQuestionnaireId,
      title: newTitle,
      description: newDescription || sourceQ.description || '',
      status: sourceQ.status || 'DRAFT',
      createdBy: sourceQ.createdBy || 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.questionnaires.push(newQuestionnaire);

    const questionIdMap = {};
    const optionIdMap = {};

    // 1. Clone questions
    const oldQuestions = data.questions.filter(q => q.questionnaireId === sourceQuestionnaireId);
    const newQuestions = oldQuestions.map(oldQ => {
      const newQId = crypto.randomUUID();
      questionIdMap[oldQ._id] = newQId;
      return {
        ...oldQ,
        _id: newQId,
        questionnaireId: newQuestionnaireId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
    data.questions.push(...newQuestions);

    // 2. Clone options
    const oldQuestionIds = oldQuestions.map(q => q._id);
    const oldOptions = data.options.filter(o => oldQuestionIds.includes(o.questionId));
    const newOptions = oldOptions.map(oldO => {
      const newOId = crypto.randomUUID();
      optionIdMap[oldO._id] = newOId;
      return {
        ...oldO,
        _id: newOId,
        questionId: questionIdMap[oldO.questionId],
        createdAt: new Date().toISOString()
      };
    });
    data.options.push(...newOptions);

    // 3. Clone rules
    const oldRules = data.rules ? data.rules.filter(r => oldQuestionIds.includes(r.questionId)) : [];
    const newRules = oldRules.map(oldR => {
      const newRId = crypto.randomUUID();
      const newOptionId = optionIdMap[oldR.optionId] || oldR.optionId;
      const newNextQuestionId = questionIdMap[oldR.nextQuestionId] || oldR.nextQuestionId;
      return {
        ...oldR,
        _id: newRId,
        questionId: questionIdMap[oldR.questionId],
        optionId: newOptionId,
        nextQuestionId: newNextQuestionId,
        createdAt: new Date().toISOString()
      };
    });
    if (newRules.length > 0) {
      if (!data.rules) data.rules = [];
      data.rules.push(...newRules);
    }

    // 4. Clone submissions
    const oldSubmissions = data.submissions ? data.submissions.filter(s => s.questionnaireId === sourceQuestionnaireId) : [];
    const newSubmissions = oldSubmissions.map(oldS => {
      const newSId = crypto.randomUUID();
      const newAnswers = (oldS.answers || []).map(oldAns => {
        const newQId = questionIdMap[oldAns.questionId] || oldAns.questionId;
        const newAnsVal = optionIdMap[oldAns.answer] || oldAns.answer;
        return {
          ...oldAns,
          questionId: newQId,
          answer: newAnsVal
        };
      });
      return {
        ...oldS,
        _id: newSId,
        questionnaireId: newQuestionnaireId,
        answers: newAnswers,
        submittedAt: new Date().toISOString()
      };
    });
    if (newSubmissions.length > 0) {
      if (!data.submissions) data.submissions = [];
      data.submissions.push(...newSubmissions);
    }

    saveData(data);
    return newQuestionnaireId;
  }
}

module.exports = QuestionnaireService;
