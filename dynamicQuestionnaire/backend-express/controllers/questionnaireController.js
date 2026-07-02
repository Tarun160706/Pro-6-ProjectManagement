const QuestionnaireService = require('../services/questionnaireService');

/**
 * GET /api/v1/questionnaires
 */
const getAll = async (req, res) => {
  try {
    const questionnaires = QuestionnaireService.getAll();
    res.status(200).json(questionnaires);
  } catch (error) {
    console.error('Error fetching questionnaires:', error.message);
    res.status(500).json({ message: 'Failed to fetch questionnaires', error: error.message });
  }
};

/**
 * GET /api/v1/questionnaires/published
 */
const getPublished = async (req, res) => {
  try {
    const questionnaires = QuestionnaireService.getPublished();
    res.status(200).json(questionnaires);
  } catch (error) {
    console.error('Error fetching published questionnaires:', error.message);
    res.status(500).json({ message: 'Failed to fetch published questionnaires', error: error.message });
  }
};

/**
 * GET /api/v1/questionnaires/:id
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const questionnaire = QuestionnaireService.getById(id);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }
    res.status(200).json(questionnaire);
  } catch (error) {
    console.error('Error fetching questionnaire:', error.message);
    res.status(500).json({ message: 'Failed to fetch questionnaire', error: error.message });
  }
};

/**
 * POST /api/v1/questionnaires
 */
const create = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const questionnaireId = QuestionnaireService.createQuestionnaire(title.trim(), description || '', 'ADMIN');
    res.status(201).json({ questionnaireId });
  } catch (error) {
    console.error('Error creating questionnaire:', error.message);
    res.status(500).json({ message: 'Failed to create questionnaire', error: error.message });
  }
};

/**
 * PUT /api/v1/questionnaires/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (status !== undefined) dataToUpdate.status = status;

    const updated = QuestionnaireService.updateQuestionnaire(id, dataToUpdate);
    if (!updated) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }
    res.status(200).json({ message: 'Questionnaire updated' });
  } catch (error) {
    console.error('Error updating questionnaire:', error.message);
    res.status(500).json({ message: 'Failed to update questionnaire', error: error.message });
  }
};

/**
 * DELETE /api/v1/questionnaires/:id
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = QuestionnaireService.deleteQuestionnaire(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }
    res.status(200).json({ message: 'Questionnaire deleted' });
  } catch (error) {
    console.error('Error deleting questionnaire:', error.message);
    res.status(500).json({ message: 'Failed to delete questionnaire', error: error.message });
  }
};

/**
 * POST /api/v1/questionnaires/:id/publish
 */
const publish = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = QuestionnaireService.publishQuestionnaire(id);
    if (!updated) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }
    res.status(200).json({ message: 'Questionnaire Published' });
  } catch (error) {
    console.error('Error publishing questionnaire:', error.message);
    res.status(500).json({ message: 'Failed to publish questionnaire', error: error.message });
  }
};

/**
 * POST /api/v1/questionnaires/:id/copy
 */
const copy = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required for the copy' });
    }
    const newQuestionnaireId = QuestionnaireService.cloneQuestionnaire(id, title.trim(), description || '');
    res.status(201).json({ questionnaireId: newQuestionnaireId });
  } catch (error) {
    console.error('Error copying questionnaire:', error.message);
    res.status(500).json({ message: 'Failed to copy questionnaire', error: error.message });
  }
};

module.exports = { getAll, getPublished, getById, create, update, remove, publish, copy };
