const router = require('express').Router();
const auth = require('../app/middlewares/auth')
const groupController = require('../app/controllers/group/group.controller')
const hasGroupAccess = require('../app/middlewares/hasGroupAccess')

const multer = require('multer');

const mime = require('mime-types')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        let ext = mime.extension(file.mimetype);
        cb(null, Date.now() + '.' + ext)
    }
})

const upload = multer({storage: storage});

router.post('/:id/requests/:requestId/accept', auth(), hasGroupAccess, groupController.acceptRequest);

router.delete('/:id/requests/:requestId', auth(), hasGroupAccess, groupController.removeRequest);

router.get('/:id/requests', auth(), hasGroupAccess, groupController.requests);

router.get('/:id/members', auth(), hasGroupAccess, groupController.getMembers);

router.post('/:id/posts', auth(), upload.array('files'), groupController.createPost);

router.get('/:id/posts', auth(), groupController.getPosts);

router.post('/:id/join', auth(), groupController.joinRequest);

router.get('/:id', auth(), groupController.viewGroup);

router.get('/', auth(), groupController.getGroups)
    .post('/', auth(), groupController.createGroup);

module.exports = router;
