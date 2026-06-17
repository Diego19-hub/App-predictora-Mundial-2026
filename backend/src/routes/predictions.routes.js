const express = require('express');
const router = express.Router();

const predictionsController = require('../controllers/predictions.controller');
const authMiddleware = require('../middlewere/auth.middleware');

router.post('/', authMiddleware, predictionsController.createOrUpdatePrediction);
router.get('/my', authMiddleware, predictionsController.getMyPredictions);
router.put('/:id', authMiddleware, predictionsController.updatePrediction);
router.delete('/:id', authMiddleware, predictionsController.deletePrediction);

/*
    Este endpoint lo usamos cuando un partido ya terminó
    y queremos asignar puntos y actualizar ranking.
    Más adelante lo podemos mover a un panel admin.
*/
router.post('/settle/:matchId', predictionsController.settleMatchPredictions);

module.exports = router;