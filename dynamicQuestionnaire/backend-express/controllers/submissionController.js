const SubmissionService = require('../services/submissionService');

/**
 * POST /api/v1/submissions
 */
const create = async (req, res) => {
  try {
    const { questionnaireId, userId, answers } = req.body;
    if (!questionnaireId) {
      return res.status(400).json({ message: 'questionnaireId is required' });
    }
    const submissionId = SubmissionService.createSubmission(
      questionnaireId,
      userId || 'anonymous',
      answers || []
    );
    res.status(201).json({ submissionId });
  } catch (error) {
    console.error('Error creating submission:', error.message);
    res.status(500).json({ message: 'Failed to create submission', error: error.message });
  }
};

/**
 * GET /api/v1/submissions
 */
const getAll = async (req, res) => {
  try {
    const submissions = SubmissionService.getAll();
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error.message);
    res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
  }
};

module.exports = { create, getAll };
