
exports.up = function (knex) {
    return knex.schema.createTable('posts', (table) => {
        table.increments();
        table.text('body');
        table.integer('userId').unsigned();
        table.string('type');

        table.string('typeId');
        table.timestamps({useCamelCase: true, defaultToNow: true})

        table.foreign('userId').references('id').inTable('users')
            .onDelete('cascade');

    });
};


exports.down = function (knex) {
    return knex.schema.dropTable('posts');
};
