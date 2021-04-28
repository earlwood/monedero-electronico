const express = require('express');
const profileController = require('../controllers/profile.controller');

const router = express.Router();

router.post('/crearPerfil', profileController.createProfile);

module.exports = router;