const express = require('express');
const router = express.Router();
const defaultRoute = require('./default.route');
const userRoute = require('./user.route');
const fakerRoute = require('./faker.route');
const courseRoute = require('./course.route');
const routineRoute = require('./routine.route');

const routes = [
    {
        path: '/routines',
        route: routineRoute
    },
    {
        path: '/courses',
        route: courseRoute,
    },
    {
        path: '/users',
        route: userRoute,
    },
    {
        path: '/faker',
        route: fakerRoute,
    },
    {
        path: '/',
        route: defaultRoute
    }

];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;