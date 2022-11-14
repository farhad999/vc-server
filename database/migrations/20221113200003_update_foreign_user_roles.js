exports.up = async function (knex) {

    await knex.schema.table('user_roles', table => {
        table.dropForeign('userId')
    });

    await knex.schema.table('user_roles', table => {
       table.foreign('userId').references('id')
           .inTable('admin_users').onDelete('cascade');
    });
};


exports.down = function (knex) {

};
