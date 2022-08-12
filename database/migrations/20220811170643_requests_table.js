
exports.up = function(knex) {
    return knex.schema.createTable('requests', (table)=> {
        table.bigIncrements();
        table.string('groupId');
        table.integer('userId').unsigned();
        table.enum('type', ['group', 'class', 'friend'])

        table.timestamps({useCamelCase: true, defaultToNow: true});

        table.foreign('groupId').references('id').inTable('groups')
            .onDelete('cascade');

        table.foreign('userId').references('id')
            .inTable('users').onDelete('cascade');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
