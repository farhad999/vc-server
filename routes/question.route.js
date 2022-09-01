const router = require('express').Router();
const questionRouter = require('../app/controllers/question.controller')
const auth = require("../app/middlewares/auth");

router.post('/:id/answer', auth, questionRouter.postAnswer);

router.post('/', auth, questionRouter.store);

router.get('/:id', auth, questionRouter.viewQuestion)

router.get('/', auth, questionRouter.index);

module.exports = router;