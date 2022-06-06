const express = require('express');
const router = express.Router();
const db = require('../config/database')
const knex = require('knex');

const routes = [
    {
        path: '/',
        route: async (req, res)=>{

            res.send("hello");
        },
    },

];

routes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;