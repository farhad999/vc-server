/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('classes', (table) => {
      table.string('id').primary();
      table.integer('routineId').unsigned();
      table.integer('courseId').unsigned();
      table.integer('teacherId').unsigned();
      table.timestamps({defaultToNow: true, useCamelCase: true});
      table.timestamp('deletedAt').nullable();

      table.foreign('routineId').references('id').inTable('routines').onDelete('cascade');
      table.foreign('courseId').references('id').inTable('courses').onDelete('cascade');
      table.foreign('teacherId').references('id').inTable('users');

  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('classes');
};
