const router = require('express').Router();
const authController = require('../../app/controllers/admin/auth.controller')
const auth = require('../../app/middlewares/auth')

router.post('/login', authController.login);

router.get('/user', auth('admin'), authController.getUser);

module.exports = router;
