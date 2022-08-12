const router = require('express').Router();
const auth = require('../app/middlewares/auth')
const groupController = require('../app/controllers/group/group.controller')
const hasGroupAccess = require('../app/middlewares/hasGroupAccess')

router.post('/:id/join', auth, groupController.joinRequest);

router.get('/:id', auth, groupController.viewGroup);

router.get('/', auth, groupController.getGroups)
    .post('/', auth, groupController.createGroup);

module.exports = router;