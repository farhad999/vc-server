const express = require('express');
const authController = require('../app/controllers/auth.controller')
const auth = require('../app/middlewares/auth');
const designationController = require('../app/controllers/designation.controller')


const router = express.Router();

router.post('/login', authController.login);

router.get('/user', auth, authController.getUser);

router.post("/logout", auth, authController.logout);

//designation

router.post('/designations', auth, designationController.store);

router.get('/designations', auth, designationController.index);

//for download
router.get("/down", (req, res) => {
    res.send("hello");
});

module.exports = router;
