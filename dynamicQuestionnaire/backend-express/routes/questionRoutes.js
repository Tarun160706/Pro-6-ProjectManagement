const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Static routes before /:id
router.get('/questionnaire/:questionnaireId', questionController.getByQuestionnaire);
router.post('/', questionController.create);
router.get('/', questionController.getAll);
router.get('/:id', questionController.getById);
router.put('/:id', questionController.update);
router.delete('/:id', questionController.remove);

module.exports = router;
