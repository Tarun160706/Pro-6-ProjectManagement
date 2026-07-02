const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

router.post('/', submissionController.create);
router.get('/', submissionController.getAll);

module.exports = router;
