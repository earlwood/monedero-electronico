const express = require('express');
const commerceController = require('../controllers/commerce.controller');

const router = express.Router();

router.get('/getAllCommerces', commerceController.getAllCommerce);
router.post('/createCommerce', commerceController.createCommerce);
router.put('/updateCommerce/:id', commerceController.updateCommerce);

module.exports = router;