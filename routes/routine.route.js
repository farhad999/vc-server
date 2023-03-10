const express = require('express');
const auth = require('../app/middlewares/auth');
const hasPermission = require('../app/middlewares/permissions.middleware')
const routineController = require('../app/controllers/routine.controller')

const router = express.Router();

router.get('/:routineId/classes/:classId/can_edit', auth(), routineController.canEdit);

router.put('/:routineId/classes/:classId', auth('admin'), hasPermission('routine.create'), routineController.updateClass);

router.post('/:routineId/classes', auth('admin'), hasPermission('routine.create', ['teacher']), routineController.addClass);

router.get('/:routineId/classes', auth('admin'), hasPermission('routine.view', ['teacher']), routineController.getRoutineClasses);

router.get('/:routineId/:courseId', auth(), routineController.getRoutineClassInfo);

router.post('/:routineId/publish', auth('admin'), hasPermission('routine.view', ['teacher']), routineController.publish);

router.get('/:routineId', auth('admin'), hasPermission('routine.view', ['teacher']), routineController.viewRoutine);

router.put('/:routineId/activate-deactivate', auth('admin'), hasPermission('routine.update'), routineController.activateOrDeactivate);

router.delete('/:routineId', auth('admin'), hasPermission('routine.delete'), routineController.deleteRoutine);

router.post('/', auth('admin'), hasPermission('routine.create'), routineController.createOrUpdateRoutine);

router.get('/', auth('admin'), hasPermission('routine.view'), routineController.getRoutines);

module.exports = router;
