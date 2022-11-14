const router = require('express').Router();
const authRoute = require('./auth.route');
const auth = require('../../app/middlewares/auth')
const homeController = require('../../app/controllers/admin/home.controller')

router.use('/auth', authRoute);

router.get('/', auth('admin'), homeController.index);

module.exports = router;
