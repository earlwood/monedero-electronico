const express = require('express');
const customerController = require('../controllers/customer.controller');

const router = express.Router();

router.get('/getAllCustomers', customerController.getAllCustomers);
router.post('/createCustomer', customerController.createCustomer);
// router.put('/updateCommerce/:id', customerController.updateCommerce);

module.exports = router;