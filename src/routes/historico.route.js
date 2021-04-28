const express = require('express');
const historicoController = require('../controllers/historico.controller');

const router = express.Router();

router.get('/getAllHistoricos', historicoController.getAllHistorico);
router.post('/createHistorico', historicoController.createHistorico);
router.put('/updateHistorico/:id', historicoController.updateHistorico);

module.exports = router;