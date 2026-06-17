const express = require('express');
const router = express.Router();

const rankingController = require('../controllers/ranking.controller');
const authMiddleware = require('../middlewere/auth.middleware');

router.get('/', rankingController.getRanking);
router.get('/me', authMiddleware, rankingController.getMyRanking);

module.exports = router;