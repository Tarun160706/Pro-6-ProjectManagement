const express = require('express');
const router = express.Router();
const outOfScopeController = require('../controllers/outOfScopeController');

router.get('/', outOfScopeController.getAll);
router.post('/', outOfScopeController.create);
router.put('/:id', outOfScopeController.update);
router.delete('/:id', outOfScopeController.remove);

module.exports = router;
