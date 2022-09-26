const express = require('express');
const auth = require('../app/middlewares/auth');
const hasPermission = require('../app/middlewares/permissions.middleware')
const routineController = require('../app/controllers/routine.controller')

const router = express.Router();

//Todo fix bug for class updating

router.get('/:routineId/classes/:classId/can_edit', auth, routineController.canEdit);

router.put('/:routineId/classes/:classId', [auth, hasPermission('routine.create')], routineController.updateClass);

router.post('/:routineId/classes', [auth, hasPermission('routine.create', ['teacher'])], routineController.addClass);

router.get('/:routineId/classes', [auth, hasPermission('routine.view', ['teacher'])], routineController.getRoutineClasses);

router.get('/:routineId/:courseId', auth, routineController.getClassInfo);

router.post('/:routineId/publish', [auth, hasPermission('routine.view', ['teacher'])], routineController.publish);

router.get('/:routineId', [auth, hasPermission('routine.view', ['teacher'])], routineController.viewRoutine);

router.put('/:routineId/activate-deactivate', [auth, hasPermission('routine.update')], routineController.activateOrDeactivate);

router.delete('/:routineId', [auth, hasPermission('routine.delete')], routineController.deleteRoutine);

router.post('/', [auth, hasPermission('routine.create')], routineController.createOrUpdateRoutine);

router.get('/', [auth, hasPermission('routine.view')], routineController.getRoutines);

module.exports = router;
