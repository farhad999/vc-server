const router = require('express').Router();

const classroomController = require('../app/controllers/classroom.controller')

const auth = require('../app/middlewares/auth');

const checkUserType = require('../app/middlewares/checkUserType.middleware')

const hasAccessInClass = require('../app/middlewares/hasAccessInClass.middleware');

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

router.post('/:classId/posts', [auth, checkUserType(['teacher']), hasAccessInClass, upload.array('files')], classroomController.createPost)

router.get('/:classId/posts', auth, checkUserType(['teacher', 'student']), hasAccessInClass, classroomController.getPosts);

router.get('/:classId', [auth, checkUserType(['student', 'teacher']), hasAccessInClass], classroomController.index);


router.get('/', [auth, checkUserType(['student', 'teacher'])], classroomController.classes);

module.exports = router;