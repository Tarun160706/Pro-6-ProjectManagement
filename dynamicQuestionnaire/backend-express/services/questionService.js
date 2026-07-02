const crypto = require('crypto');
const { loadData, saveData } = require('./dataStore');

class QuestionService {
  static createQuestion(questionnaireId, questionText, questionType, isStarQuestion, platform, module, subModule) {
    const data = loadData();

    if (isStarQuestion === true || isStarQuestion === 'true') {
      const existingStart = data.questions.find(
        q => q.questionnaireId === questionnaireId && (q.isStarQuestion === true || q.isStarQuestion === 'true')
      );
      if (existingStart) {
        throw new Error('Start question already exists');
      }
    }

    const question = {
      _id: crypto.randomUUID(),
      questionnaireId,
      questionText,
      questionType,
      isStarQuestion: isStarQuestion === true || isStarQuestion === 'true',
      platform: platform || '',
      module: module || '',
      subModule: subModule || '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.questions.push(question);
    saveData(data);
    return question._id;
  }

  static getAll() {
    const data = loadData();
    return data.questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static getById(questionId) {
    const data = loadData();
    return data.questions.find(q => q._id === questionId) || null;
  }

  static getByQuestionnaireId(questionnaireId) {
    const data = loadData();
    return data.questions
      .filter(q => q.questionnaireId === questionnaireId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static updateQuestion(questionId, dataToUpdate) {
    const data = loadData();
    const index = data.questions.findIndex(q => q._id === questionId);
    if (index !== -1) {
      data.questions[index] = {
        ...data.questions[index],
        ...dataToUpdate,
        updatedAt: new Date().toISOString()
      };
      saveData(data);
      return true;
    }
    return false;
  }

  static deleteQuestion(questionId) {
    const data = loadData();

    // Cascade delete: options and rules for this question
    data.options = data.options.filter(o => o.questionId !== questionId);
    data.rules = data.rules.filter(r => r.questionId !== questionId);
    data.questions = data.questions.filter(q => q._id !== questionId);

    saveData(data);
    return true;
  }

  static getStartQuestion(questionnaireId) {
    const data = loadData();
    return data.questions.find(
      q => q.questionnaireId === questionnaireId && (q.isStarQuestion === true || q.isStarQuestion === 'true')
    ) || null;
  }
}

module.exports = QuestionService;
