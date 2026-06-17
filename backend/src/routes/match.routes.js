const express = require('express');
const router = express.Router();

const matchController = require('../controllers/matches.controller');
const authMiddleware = require('../middlewere/auth.middleware');
const adminMiddleware = require('../middlewere/admin.middleware');

router.get('/upcoming', matchController.getUpcomingMatches);
router.get('/live', matchController.getLiveMatches);
router.get('/finished', matchController.getFinishedMatches);
router.get('/:id', matchController.getMatchById);


// admin
router.put('/admin/:id/result', authMiddleware, adminMiddleware, matchController.updateMatchResult);

module.exports = router;