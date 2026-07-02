const express = require('express');
const router = express.Router();
const engineController = require('../controllers/engineController');

router.post('/next-question', engineController.getNextQuestion);

module.exports = router;
