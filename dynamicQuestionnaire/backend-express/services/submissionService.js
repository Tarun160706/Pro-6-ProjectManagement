const crypto = require('crypto');
const { loadData, saveData } = require('./dataStore');

class SubmissionService {
  static createSubmission(questionnaireId, userId, answers) {
    const data = loadData();
    const submission = {
      _id: crypto.randomUUID(),
      questionnaireId,
      userId: userId || 'anonymous',
      answers: answers || [],
      status: 'COMPLETED',
      submittedAt: new Date().toISOString()
    };
    data.submissions.push(submission);
    saveData(data);
    return submission._id;
  }

  static getAll() {
    const data = loadData();
    return data.submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  static getByUserId(userId) {
    const data = loadData();
    return data.submissions
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }
}

module.exports = SubmissionService;
