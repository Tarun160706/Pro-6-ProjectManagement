const StatusService = require('../services/statusService');

/**
 * GET /api/v1/questionnaires/status/:questionnaireId
 */
const getStatus = async (req, res) => {
  try {
    const { questionnaireId } = req.params;
    const status = StatusService.getQuestionnaireStatus(questionnaireId);
    res.status(200).json(status);
  } catch (error) {
    console.error('Error fetching questionnaire status:', error.message);
    res.status(500).json({ message: 'Failed to fetch questionnaire status', error: error.message });
  }
};

/**
 * GET /api/v1/questionnaires/status
 */
const getAllStatuses = async (req, res) => {
  try {
    const statuses = StatusService.getAllQuestionnairesStatus();
    res.status(200).json(statuses);
  } catch (error) {
    console.error('Error fetching all statuses:', error.message);
    res.status(500).json({ message: 'Failed to fetch all statuses', error: error.message });
  }
};

module.exports = { getStatus, getAllStatuses };
