const express = require('express');
const routes = require('../routes/api');
const app = express();
const databse = require('../config/database');

// parse json request body
app.use(express.json());

// v1 api routes
app.use('/api/v1', routes);

//mysql connection
//databse.connection();

module.exports = app;