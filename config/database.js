const mysql = require('mysql');
const knexFile = require('../knexfile');
const knex = require('knex');
// Create the connection pool. The pool-specific settings are the defaults

const db = knex(knexFile);

module.exports = db;