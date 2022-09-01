const {Model} = require('objection');
const db = require('../../config/database')

Model.knex(db);

class Question extends Model {
    // Table name is the only required property.
    static get tableName() {
        return 'questions';
    }

    static get idColumn() {
        return 'id';
    }

    // This object defines the relations to other models.
    static get relationMappings() {
        // Importing models here is one way to avoid require loops.
        const User = require('./User');
        const Answer = require('./Answer')

        return {

            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'questions.userId',
                    to: 'users.id'
                }
            },
            answers: {
                relation: Model.HasManyRelation,
                modelClass: Answer,
                join: {
                    from: 'answers.userId',
                    to: 'users.id'
                }
            }

        };
    }
}

module.exports = Question;