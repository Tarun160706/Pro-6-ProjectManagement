const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaireController');

// Static routes MUST be before /:id
router.get('/published', questionnaireController.getPublished);
router.post('/', questionnaireController.create);
router.get('/', questionnaireController.getAll);
router.get('/:id', questionnaireController.getById);
router.put('/:id', questionnaireController.update);
router.delete('/:id', questionnaireController.remove);
router.post('/:id/publish', questionnaireController.publish);
router.post('/:id/copy', questionnaireController.copy);

module.exports = router;
