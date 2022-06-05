const express = require('express');
const routes = require('../routes/api');
const app = express();

// parse json request body
app.use(express.json());

// v1 api routes
app.use('/api/v1', routes);

module.exports = app;