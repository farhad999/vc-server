/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('posts', (table) => {
        table.increments();
        table.text('body');
        table.integer('userId').unsigned();
        table.string('classId');
        table.timestamps({useCamelCase: true, defaultToNow: true})

        table.foreign('classId').references('id').inTable('classes')
            .onDelete('cascade');

        table.foreign('userId').references('id').inTable('users')
            .onDelete('cascade');

    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('posts');
};
