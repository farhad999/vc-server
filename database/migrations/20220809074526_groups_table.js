exports.up = function (knex) {
    return knex.schema.createTable('groups', (table) => {
        table.string('id').primary();
        table.string('name');
        table.integer('adminId').unsigned();
        table.string('invitationCode').notNullable();
        table.timestamps({useCamelCase: true, defaultToNow: true})

        table.foreign('adminId').references('id')
            .inTable('users').onDelete('cascade');
    })
};


exports.down = function (knex) {
    return knex.schema.dropTable('groups');
};