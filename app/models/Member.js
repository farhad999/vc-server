const { Model } = require('objection');
const db = require('../../config/database')

Model.knex(db);

class Member extends Model {
    // Table name is the only required property.
    static get tableName() {
        return 'members';
    }

    static get idColumn() {
        return 'id';
    }

    static get relationMappings(){

        const Group = require('./Group');
        const User = require('./User');

       return {
           group: {
               relation: Model.BelongsToOneRelation,
               modelClass: Group,
               join: {
                   from: 'groups.id',
                   to: 'members.groupId',
               }
           },
           user: {
               relation: Model.BelongsToOneRelation,
               modelClass: User,
               join: {
                   from: 'users.id',
                   to: 'members.userId',
               }
           }
       }

    }

}

module.exports = Member;