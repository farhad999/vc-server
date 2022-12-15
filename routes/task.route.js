const router = require('express').Router();
const taskController = require('../app/controllers/task.controller');
const auth = require('../app/middlewares/auth')

router.get('/', auth(), taskController.index);

router.post('/', auth(), taskController.create);

router.put('/:id', taskController.toggleIsComplete);

router.delete('/:id', taskController.deleteTask);

module.exports = router;