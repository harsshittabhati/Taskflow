const express = require('express');
const router = express.Router();
const { suggestEstimate } = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

router.post('/suggest', authMiddleware, suggestEstimate);

module.exports = router;