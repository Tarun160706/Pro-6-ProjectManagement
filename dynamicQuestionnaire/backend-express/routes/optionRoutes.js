const express = require('express');
const router = express.Router();
const optionController = require('../controllers/optionController');

// Static routes before /:id
router.get('/question/:questionId', optionController.getByQuestion);
router.post('/', optionController.create);
router.put('/:id', optionController.update);
router.delete('/:id', optionController.remove);

module.exports = router;
