const express = require('express');
const monederoController = require('../controllers/monedero.controller');

const router = express.Router();

router.get('/getAllMonederos', monederoController.getAllMonederos);
router.post('/createMonedero', monederoController.createMonedero);
router.put('/updateMonedero/:id', monederoController.updateMonedero);

module.exports = router;