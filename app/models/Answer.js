const {Model} = require('objection');
const db = require('../../config/database')

Model.knex(db);

class Answer extends Model {
    // Table name is the only required property.
    static get tableName() {
        return 'answers';
    }

    static get idColumn() {
        return 'id';
    }

    // This object defines the relations to other models.
    static get relationMappings() {
        // Importing models here is one way to avoid require loops.
        const User = require('./User');

        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'answers.userId',
                    to: 'users.id'
                }
            },

        };
    }
}

module.exports = Answer;