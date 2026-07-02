const OptionService = require('../services/optionService');

/**
 * POST /api/v1/options
 */
const create = async (req, res) => {
  try {
    const { questionId, optionText, displayOrder } = req.body;
    if (!questionId || !optionText || !optionText.trim()) {
      return res.status(400).json({ message: 'questionId and optionText are required' });
    }
    const optionId = OptionService.createOption(questionId, optionText.trim(), displayOrder || 1);
    res.status(201).json({ optionId });
  } catch (error) {
    console.error('Error creating option:', error.message);
    res.status(500).json({ message: 'Failed to create option', error: error.message });
  }
};

/**
 * GET /api/v1/options/question/:questionId
 */
const getByQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const options = OptionService.getByQuestionId(questionId);
    res.status(200).json(options);
  } catch (error) {
    console.error('Error fetching options:', error.message);
    res.status(500).json({ message: 'Failed to fetch options', error: error.message });
  }
};

/**
 * PUT /api/v1/options/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { optionText, displayOrder } = req.body;
    const dataToUpdate = {};
    if (optionText !== undefined) dataToUpdate.optionText = optionText;
    if (displayOrder !== undefined) dataToUpdate.displayOrder = displayOrder;

    const updated = OptionService.updateOption(id, dataToUpdate);
    if (!updated) {
      return res.status(404).json({ message: 'Option not found' });
    }
    res.status(200).json({ message: 'Option updated' });
  } catch (error) {
    console.error('Error updating option:', error.message);
    res.status(500).json({ message: 'Failed to update option', error: error.message });
  }
};

/**
 * DELETE /api/v1/options/:id
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = OptionService.deleteOption(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Option not found' });
    }
    res.status(200).json({ message: 'Option deleted' });
  } catch (error) {
    console.error('Error deleting option:', error.message);
    res.status(500).json({ message: 'Failed to delete option', error: error.message });
  }
};

module.exports = { create, getByQuestion, update, remove };
