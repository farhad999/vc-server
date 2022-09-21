const hasPermission = require("../app/middlewares/permissions.middleware");
const auth = require("../app/middlewares/auth");

const semesterController = require('../app/controllers/semester.controller')

const router = require('express').Router();

router.delete('/:id', auth, semesterController.deleteSemester);

router.get('/', [auth, hasPermission('semester.view'), semesterController.index])

router.post('/', auth, semesterController.createOrUpdate);

module.exports = router;
