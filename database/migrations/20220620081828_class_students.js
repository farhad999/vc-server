/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('class_students', (table) => {
    table.increments();
    table.string('classId');
    table.integer('studentId').unsigned();
    table.timestamps({defaultToNow: true, useCamelCase: true})

    table.foreign('classId').references('id').inTable('classes');
    table.foreign('studentId').references('id').inTable('users');

  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
