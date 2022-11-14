const router = require('express').Router();
const authController = require('../../app/controllers/admin/auth.controller')
const auth = require('../../app/middlewares/auth')

router.post('/login', authController.login);

module.exports = router;
