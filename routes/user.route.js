const express = require('express');
const authController = require('../app/controllers/auth.controller')
const auth = require('../app/middlewares/auth');
const hasPermission = require('../app/middlewares/permissions.middleware')
const userController = require('../app/controllers/user.controller')

const router = express.Router();

router.post('/', [auth, hasPermission('user.create')], userController.store);

module.exports = router;