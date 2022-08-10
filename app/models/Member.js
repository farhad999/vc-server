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

       return {
           group: {
               relation: Model.BelongsToOneRelation,
               modelClass: Group,
               join: {
                   from: 'groups.id',
                   to: 'members.groupId',
               }
           }
       }

    }

}

module.exports = Member;