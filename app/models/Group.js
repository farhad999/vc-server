const {Model} = require('objection');
const db = require('../../config/database')
const User = require("./User");

Model.knex(db);

class Group extends Model {
    // Table name is the only required property.
    static get tableName() {
        return 'groups';
    }

    static get idColumn() {
        return 'id';
    }

    // This object defines the relations to other models.
    static get relationMappings() {
        // Importing models here is one way to avoid require loops.
        const Member = require('./Member');

        return {

            admin: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'groups.adminId',
                    to: 'users.id'
                }
            },
            users: {
                relation: Model.HasManyRelation,
                modelClass: Member,
                join: {
                    from: 'groups.id',
                    to: 'members.groupId'
                }
            },
        };
    }
}

module.exports = Group;