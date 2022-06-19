const express = require('express');
const router = express.Router();
const defaultRoute = require('./default.route');
const userRoute = require('./user.route');

const routes = [
    {
      path: '/users',
      route: userRoute,
    },
    {
        path: '/',
        route:defaultRoute
    }

];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;