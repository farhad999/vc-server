const router = require('express').Router();

const classroomController = require('../app/controllers/classroom.controller')

const auth = require('../app/middlewares/auth');

const checkUserType = require('../app/middlewares/checkUserType.middleware')

router.get('/:classId', [auth, checkUserType(['student', 'teacher'])], classroomController.index);

module.exports = router;