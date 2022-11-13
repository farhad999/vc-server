const router = require('express').Router();
const authController = require('../../app/controllers/admin/auth.controller')
const auth = require('../../app/middlewares/auth')

router.post('/login', authController.login);

router.get('/user', auth('admin'), authController.getUser);

router.post("/logout", auth('admin'), authController.logout);

module.exports = router;
