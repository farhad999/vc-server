const hasPermission = require("../app/middlewares/permissions.middleware");
const auth = require("../app/middlewares/auth");

const semesterController = require('../app/controllers/semester.controller')

const router = require('express').Router();

router.get('/', [auth, hasPermission('semester.view'), semesterController.index])

module.exports = router;