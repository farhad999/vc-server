const mysql = require('mysql');

// Create the connection pool. The pool-specific settings are the defaults
const database = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'vclassroom',
    secret: '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = database;