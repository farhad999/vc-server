const express = require('express');
const authController = require('../app/controllers/auth.controller')
const auth = require('../app/middlewares/auth');
const hasPermission = require('../app/middlewares/permissions.middleware')
const userController = require('../app/controllers/user.controller')

const router = express.Router();

router.delete('/:id', [auth, hasPermission('user.delete')], userController.deleteUser);

router.post('/', [auth, hasPermission('user.create')], userController.store);

router.get('/', [auth, hasPermission('user.view')], userController.index );

module.exports = router;
