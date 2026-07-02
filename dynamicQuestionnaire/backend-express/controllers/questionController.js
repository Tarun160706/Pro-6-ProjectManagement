const QuestionService = require('../services/questionService');

/**
 * GET /api/v1/questions
 */
const getAll = async (req, res) => {
  try {
    const questions = QuestionService.getAll();
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error.message);
    res.status(500).json({ message: 'Failed to fetch questions', error: error.message });
  }
};

/**
 * GET /api/v1/questions/:id
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = QuestionService.getById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json(question);
  } catch (error) {
    console.error('Error fetching question:', error.message);
    res.status(500).json({ message: 'Failed to fetch question', error: error.message });
  }
};

/**
 * GET /api/v1/questions/questionnaire/:questionnaireId
 */
const getByQuestionnaire = async (req, res) => {
  try {
    const { questionnaireId } = req.params;
    const questions = QuestionService.getByQuestionnaireId(questionnaireId);
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questionnaire questions:', error.message);
    res.status(500).json({ message: 'Failed to fetch questions', error: error.message });
  }
};

/**
 * POST /api/v1/questions
 */
const create = async (req, res) => {
  try {
    const { questionnaireId, questionText, questionType, isStarQuestion, platform, module, subModule } = req.body;
    if (!questionnaireId || !questionText || !questionText.trim() || !questionType) {
      return res.status(400).json({ message: 'questionnaireId, questionText, and questionType are required' });
    }
    const questionId = QuestionService.createQuestion(
      questionnaireId,
      questionText.trim(),
      questionType,
      isStarQuestion === true || isStarQuestion === 'true',
      platform || '',
      module || '',
      subModule || ''
    );
    res.status(201).json({ questionId });
  } catch (error) {
    console.error('Error creating question:', error.message);
    if (error.message === 'Start question already exists') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create question', error: error.message });
  }
};

/**
 * PUT /api/v1/questions/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionText, questionType, isStarQuestion, isActive, platform, module, subModule } = req.body;
    const dataToUpdate = {};
    if (questionText !== undefined) dataToUpdate.questionText = questionText;
    if (questionType !== undefined) dataToUpdate.questionType = questionType;
    if (isStarQuestion !== undefined) dataToUpdate.isStarQuestion = isStarQuestion;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
    if (platform !== undefined) dataToUpdate.platform = platform;
    if (module !== undefined) dataToUpdate.module = module;
    if (subModule !== undefined) dataToUpdate.subModule = subModule;

    const updated = QuestionService.updateQuestion(id, dataToUpdate);
    if (!updated) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json({ message: 'Question updated' });
  } catch (error) {
    console.error('Error updating question:', error.message);
    res.status(500).json({ message: 'Failed to update question', error: error.message });
  }
};

/**
 * DELETE /api/v1/questions/:id
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = QuestionService.deleteQuestion(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json({ message: 'Question deleted' });
  } catch (error) {
    console.error('Error deleting question:', error.message);
    res.status(500).json({ message: 'Failed to delete question', error: error.message });
  }
};

module.exports = { getAll, getById, getByQuestionnaire, create, update, remove };
