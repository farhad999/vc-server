/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('class_times', (table) => {
      table.increments();
      table.string('classId').notNullable();
      table.string('day').notNullable();
      table.string('startTime').notNullable();
      table.string('endTime').notNullable();

      table.foreign('classId').references('id').inTable('classes').onDelete('cascade');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('class_times');
};
