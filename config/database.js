const mysql = require('mysql');
const knexFile = require('../knexfile');
const knex = require('knex');

const { attachPaginate } = require('knex-paginate');
// Create the connection pool. The pool-specific settings are the defaults

const db = knex(knexFile);

attachPaginate();


module.exports = db;