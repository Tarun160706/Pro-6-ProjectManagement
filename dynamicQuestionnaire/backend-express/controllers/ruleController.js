const RuleService = require('../services/ruleService');

/**
 * POST /api/v1/rules
 */
const create = async (req, res) => {
  try {
    const { questionId, optionId, nextQuestionId } = req.body;
    if (!questionId || !optionId || !nextQuestionId) {
      return res.status(400).json({ message: 'questionId, optionId, and nextQuestionId are required' });
    }
    const ruleId = RuleService.createRule(questionId, optionId, nextQuestionId);
    res.status(201).json({ ruleId });
  } catch (error) {
    console.error('Error creating rule:', error.message);
    if (error.message === 'Rule already exists for this option') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create rule', error: error.message });
  }
};

/**
 * GET /api/v1/rules
 */
const getAll = async (req, res) => {
  try {
    const rules = RuleService.getAll();
    res.status(200).json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error.message);
    res.status(500).json({ message: 'Failed to fetch rules', error: error.message });
  }
};

/**
 * DELETE /api/v1/rules/:id
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = RuleService.deleteRule(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    res.status(200).json({ message: 'Rule Deleted' });
  } catch (error) {
    console.error('Error deleting rule:', error.message);
    res.status(500).json({ message: 'Failed to delete rule', error: error.message });
  }
};

module.exports = { create, getAll, remove };
