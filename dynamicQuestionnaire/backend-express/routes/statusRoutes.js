const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

router.get('/', statusController.getAllStatuses);
router.get('/:questionnaireId', statusController.getStatus);

module.exports = router;
