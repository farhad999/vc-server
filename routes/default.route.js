const express = require('express');
const authController = require('../app/controllers/auth.controller')
const auth = require('../app/middlewares/auth');
const designationController = require('../app/controllers/designation.controller')
const sessionController = require('../app/controllers/session.controller')
const mixController = require("../app/controllers/mix.controller");

const router = express.Router();

router.post('/login', authController.login);

router.get('/user', auth('default', false), authController.getUser);

router.post("/logout", auth(), authController.logout);

//designation

router.post('/designations', auth('admin'), designationController.store);

router.get('/designations', auth('admin'), designationController.index);

//manage sessions

router.delete('/sessions/:id', auth('admin'), sessionController.deleteSession);

router.post('/sessions', auth('admin'), sessionController.createOrUpdate);

router.get('/sessions', auth('admin'), sessionController.index);

router.get('/mates', auth(), mixController.getClassmates);

//for download
router.get("/down", (req, res) => {
    res.send("hello");
});

module.exports = router;
