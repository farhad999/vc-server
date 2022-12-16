const router = require('express').Router();
const auth = require('../app/middlewares/auth');
const classController = require('../app/controllers/class.controller')

router.get('/', auth(), classController.index);

module.exports = router;