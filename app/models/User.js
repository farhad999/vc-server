const {Model} = require('objection');
const db = require('../../config/database')

Model.knex(db);

class User extends Model {
    // Table name is the only required property.
    static get tableName() {
        return 'users';
    }

    static get idColumn() {
        return 'id';
    }

    static get virtualAttributes() {
        return ['fullName'];
    }

    fullName() {
        return this.firstName + ' ' + this.lastName;
    }

    $formatJson(json) {
        delete json.password;
        delete json.deletedAt;
        return super.$formatJson(json);
    }

}

module.exports = User;