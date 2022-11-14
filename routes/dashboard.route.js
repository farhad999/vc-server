const router = require('express').Router();
const dashboardController = require('../app/controllers/dashboard.controller')
const auth = require("../app/middlewares/auth");

router.get('/', auth(), dashboardController.index);

module.exports = router;
