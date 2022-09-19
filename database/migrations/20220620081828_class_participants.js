/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('class_participants', (table) => {
    table.increments();
    table.string('classId');
    table.integer('userId').unsigned();
    table.timestamps({defaultToNow: true, useCamelCase: true})

    table.foreign('classId').references('id').inTable('classes').onDelete('cascade');
    table.foreign('userId').references('id').inTable('users').onDelete('cascade');

  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('class_participants');
};
