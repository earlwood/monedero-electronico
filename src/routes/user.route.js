const express = require('express');

const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/getAllUsers', userController.getAllUsers);
router.post('/createUser', userController.createUserRoot);
router.post('/createUserStore', userController.createUserStore);
// router.post('/login', userController.login);

module.exports = router;