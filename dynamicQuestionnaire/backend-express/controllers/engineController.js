const RuleService = require('../services/ruleService');

/**
 * POST /api/v1/engine/next-question
 */
const getNextQuestion = async (req, res) => {
  try {
    const { questionId, selectedOptionId } = req.body;
    if (!questionId || !selectedOptionId) {
      return res.status(400).json({ message: 'questionId and selectedOptionId are required' });
    }
    const question = RuleService.getNextQuestion(questionId, selectedOptionId);
    if (!question) {
      return res.status(404).json({ message: 'No next question found' });
    }
    res.status(200).json(question);
  } catch (error) {
    console.error('Error getting next question:', error.message);
    res.status(500).json({ message: 'Failed to get next question', error: error.message });
  }
};

module.exports = { getNextQuestion };
