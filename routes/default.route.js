const express = require('express');
const authController = require('../app/controllers/auth.controller')
const auth = require('../app/middlewares/auth');


const router = express.Router();

router.post('/login', authController.login);

router.get('/user', auth, authController.getUser);

router.post("/logout", auth, authController.logout);

//for download
router.get("/down", (req, res) => {
    res.send("hello");
});

module.exports = router;