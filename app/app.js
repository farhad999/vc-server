const express = require('express');
const routes = require('../routes/api');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

//env
dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())

// v1 api routes
app.use('/api/v1', routes);



module.exports = app;