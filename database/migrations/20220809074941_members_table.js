exports.up = function (knex) {
    return knex.schema.createTable('members', (table) => {
        table.increments();
        table.integer('userId').unsigned();
        table.string('groupId');

        table.foreign('userId').references('id').inTable('users')
            .onDelete('cascade');

        table.foreign('groupId').references('id').inTable('groups')
            .onDelete('cascade');
    })
};

exports.down = function (knex) {
    return knex.schema.dropTable('members');
};
