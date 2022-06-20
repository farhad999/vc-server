const express = require('express');
const auth = require('../app/middlewares/auth');
const hasPermission = require('../app/middlewares/permissions.middleware')
const routineController = require('../app/controllers/routine.controller')

const router = express.Router();


router.delete('/:routineId', [auth, hasPermission('routine.delete')], routineController.deleteRoutine);

router.put('/:routineId', [auth, hasPermission('routine.update')], routineController.update);

router.post('/', [auth, hasPermission('routine.create')], routineController.createRoutine);

router.get('/', [auth, hasPermission('routine.view')], routineController.getRoutines);

module.exports = router;