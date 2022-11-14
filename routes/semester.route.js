const hasPermission = require("../app/middlewares/permissions.middleware");
const auth = require("../app/middlewares/auth");

const semesterController = require('../app/controllers/semester.controller')

const router = require('express').Router();

router.delete('/:id', auth('admin'), semesterController.deleteSemester);

router.get('/', auth('admin'), hasPermission('semester.view'), semesterController.index)

router.post('/', auth('admin'), semesterController.createOrUpdate);

module.exports = router;
