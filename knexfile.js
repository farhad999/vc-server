const path = require('path');

module.exports = {

    client: 'mysql',
    connection: {
        database: 'vclassroom',
        user: 'root',
        password: ''
    },
    migrations: {
        tableName: 'knex_migrations',
        directory: path.join(__dirname, 'database/migrations')
    },
    seeds: {
        directory: path.join(__dirname, 'database/seeds'),
        timestampFilenamePrefix: true
    }

};
