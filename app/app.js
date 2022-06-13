const express = require('express');
const routes = require('../routes/api');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');

//env
dotenv.config();

//cors
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())

// v1 api routes
app.use('/api/v1', routes);



module.exports = app;