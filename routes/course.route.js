const express = require('express');
const auth = require('../app/middlewares/auth');
const hasPermission = require('../app/middlewares/permissions.middleware');
const courseController = require('../app/controllers/course.controller');

const router = express.Router();

router.put('/:courseId', auth('admin'), hasPermission('course.update'),  courseController.update);

router.delete('/:courseId', auth('admin'), hasPermission('course.delete'),  courseController.deleteCourse);

router.post('/', auth('admin'), hasPermission('course.create'),  courseController.store);

router.get('/', auth('admin'), hasPermission('course.view', ['teacher']),  courseController.index);

module.exports = router;
