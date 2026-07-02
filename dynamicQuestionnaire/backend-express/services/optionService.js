const crypto = require('crypto');
const { loadData, saveData } = require('./dataStore');

class OptionService {
  static createOption(questionId, optionText, displayOrder) {
    const data = loadData();
    const option = {
      _id: crypto.randomUUID(),
      questionId,
      optionText,
      displayOrder: displayOrder || 1,
      createdAt: new Date().toISOString()
    };
    data.options.push(option);
    saveData(data);
    return option._id;
  }

  static getByQuestionId(questionId) {
    const data = loadData();
    return data.options
      .filter(o => o.questionId === questionId)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  static updateOption(optionId, dataToUpdate) {
    const data = loadData();
    const index = data.options.findIndex(o => o._id === optionId);
    if (index !== -1) {
      data.options[index] = {
        ...data.options[index],
        ...dataToUpdate
      };
      saveData(data);
      return true;
    }
    return false;
  }

  static deleteOption(optionId) {
    const data = loadData();
    data.options = data.options.filter(o => o._id !== optionId);
    saveData(data);
    return true;
  }
}

module.exports = OptionService;
