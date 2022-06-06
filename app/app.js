const express = require('express');
const routes = require('../routes/api');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())

// v1 api routes
app.use('/api/v1', routes);



module.exports = app;