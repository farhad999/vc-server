const dotenv = require('dotenv');
const path = require('path');

const env = dotenv.config({path: path.join(__dirname, '../.env')}).parsed;



module.exports = {
    ...env
}