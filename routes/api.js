const express = require('express');
const router = express.Router();
const defaultRoute = require('./default.route')


const routes = [
    {
        path: '/',
        route:defaultRoute
    }

];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;