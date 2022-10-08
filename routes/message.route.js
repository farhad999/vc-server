const auth = require("../app/middlewares/auth");
const messageController = require('../app/controllers/message.controller')
const router = require('express').Router();

router.post('/start', auth, messageController.start);

router.get('/:id',auth, messageController.viewConversation);

router.post('/:id', auth, messageController.sendMessage);

router.get('/', auth, messageController.getConversationList);

module.exports = router;
