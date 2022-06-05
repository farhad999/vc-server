const express = require('express');

const router = express.Router();

const routes = [
    {
        path: '/',
        route: (req, res)=>{
            res.send("hello");
        },
    },

];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;