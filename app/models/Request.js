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

    static get relationMappings() {
        const User = require('./User');
        return{
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'users.id',
                    to: 'requests.userId',
                }
            }
        }
    }

}

module.exports = Request;