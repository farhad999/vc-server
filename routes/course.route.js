const express = require('express');
const auth = require('../app/middlewares/auth');
const hasPermission = require('../app/middlewares/permissions.middleware');
const courseController = require('../app/controllers/course.controller');

const router = express.Router();

router.put('/:courseId', [auth, hasPermission('course.update')],  courseController.update);

router.delete('/:courseId', [auth, hasPermission('course.delete')],  courseController.deleteCourse);

router.post('/', [auth, hasPermission('course.create')],  courseController.store);

router.get('/', [auth, hasPermission('course.view')],  courseController.index);

module.exports = router;