const express = require('express');
const authController = require('../app/controllers/auth.controller')
const auth = require('../app/middlewares/auth');
const hasPermission = require('../app/middlewares/permissions.middleware')
const userController = require('../app/controllers/user.controller')

const router = express.Router();

router.post('/promote_students', auth('admin'), userController.promoteStudents);

router.delete('/:id', auth('admin'), hasPermission('user.delete'), userController.deleteUser);

router.post('/', auth('admin'), hasPermission('user.create'), userController.store);

router.get('/', auth('admin'), hasPermission('user.view'), userController.index );

module.exports = router;
