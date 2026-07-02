const { loadData } = require('./dataStore');

class StatusService {
  /**
   * Get submission status for a specific questionnaire.
   * @param {string} questionnaireId
   * @returns {{ questionnaireId: string, submissionCount: number, isAnswered: boolean }}
   */
  static getQuestionnaireStatus(questionnaireId) {
    const data = loadData();
    const submissions = data.submissions.filter(s => s.questionnaireId === questionnaireId);
    const submissionCount = submissions.length;
    return {
      questionnaireId,
      submissionCount,
      isAnswered: submissionCount > 0
    };
  }

  /**
   * Get submission status for all questionnaires that have submissions.
   * @returns {Object.<string, { questionnaireId: string, submissionCount: number, isAnswered: boolean }>}
   */
  static getAllQuestionnairesStatus() {
    const data = loadData();
    const statusMap = {};

    for (const submission of data.submissions) {
      const qId = submission.questionnaireId;
      if (!statusMap[qId]) {
        statusMap[qId] = {
          questionnaireId: qId,
          submissionCount: 0,
          isAnswered: false
        };
      }
      statusMap[qId].submissionCount += 1;
      statusMap[qId].isAnswered = true;
    }

    return statusMap;
  }
}

module.exports = StatusService;
