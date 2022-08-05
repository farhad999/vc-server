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

router.put('/:classId/att/:attId', [auth, hasAccessInClass], classroomController.updateAttendance);

router.post('/:classId/att', [auth, hasAccessInClass], classroomController.postAttendance);

router.get('/:classId/att', [auth, hasAccessInClass], classroomController.getAttendances);

//participants

router.get('/:classId/participants', [auth, hasAccessInClass], classroomController.getParticipants)

router.post('/:classId/posts', [auth, checkUserType(['teacher']), hasAccessInClass, upload.array('files')], classroomController.createPost)

router.get('/:classId/posts', auth, checkUserType(['teacher', 'student']), hasAccessInClass, classroomController.getPosts);

//assignments

router.get('/:classId/assignments/:a', auth, hasAccessInClass, classroomController.viewAssignment);

router.delete('/:classId/assignments/:a', auth, hasAccessInClass, classroomController.deleteAssignment);

router.post('/:classId/assignments', auth, hasAccessInClass, classroomController.createOrUpdateAssignment);

router.get('/:classId/assignments', auth, hasAccessInClass, classroomController.getAssignments);

router.get('/:classId', [auth, checkUserType(['student', 'teacher']), hasAccessInClass], classroomController.index);


router.get('/', [auth, checkUserType(['student', 'teacher'])], classroomController.classes);

module.exports = router;