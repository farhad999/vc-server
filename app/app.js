const express = require('express');
const routes = require('../routes/api');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require("path");

//env
dotenv.config();

//cors
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())

const dir = path.join(__dirname, '../uploads');

//uploads file will be accessible as files/filename.ext
app.use('/files', express.static(dir));

// v1 api routes
app.use('/api/v1', routes);

module.exports = app;