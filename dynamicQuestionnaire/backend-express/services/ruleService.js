const crypto = require('crypto');
const { loadData, saveData } = require('./dataStore');

class RuleService {
  static createRule(questionId, optionId, nextQuestionId) {
    const data = loadData();

    // Check if rule already exists for this question+option combination
    const existingRule = data.rules.find(
      r => r.questionId === questionId && r.optionId === optionId && r.isActive === true
    );
    if (existingRule) {
      throw new Error('Rule already exists for this option');
    }

    const rule = {
      _id: crypto.randomUUID(),
      questionId,
      optionId,
      nextQuestionId,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    data.rules.push(rule);
    saveData(data);
    return rule._id;
  }

  static getAll() {
    const data = loadData();
    return data.rules.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static getByRuleId(ruleId) {
    const data = loadData();
    return data.rules.find(r => r._id === ruleId) || null;
  }

  static getRuleByQuestionAndOption(questionId, optionId) {
    const data = loadData();
    return data.rules.find(
      r => r.questionId === questionId && r.optionId === optionId && r.isActive === true
    ) || null;
  }

  static deleteRule(ruleId) {
    const data = loadData();
    data.rules = data.rules.filter(r => r._id !== ruleId);
    saveData(data);
    return true;
  }

  static getNextQuestion(questionId, selectedOptionId) {
    const data = loadData();
    const rule = data.rules.find(
      r => r.questionId === questionId && r.optionId === selectedOptionId && r.isActive === true
    );

    if (!rule) return null;

    const question = data.questions.find(q => q._id === rule.nextQuestionId);
    return question || null;
  }
}

module.exports = RuleService;
