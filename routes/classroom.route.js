const router = require('express').Router();

const classroomController = require('../app/controllers/classroom.controller')

const auth = require('../app/middlewares/auth');

const checkUserType = require('../app/middlewares/checkUserType.middleware')

const hasAccessInClass = require('../app/middlewares/hasAccessInClass.middleware');

router.get('/:classId', [auth, checkUserType(['student', 'teacher']), hasAccessInClass], classroomController.index);

module.exports = router;