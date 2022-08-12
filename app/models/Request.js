const { Model } = require('objection');
const db = require('../../config/database')

Model.knex(db);

class Request extends Model {
    // Table name is the only required property.
    static get tableName() {
        return 'requests';
    }

    static get idColumn() {
        return 'id';
    }

}

module.exports = Request;