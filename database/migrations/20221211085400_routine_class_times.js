/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('routine_class_times', (table) => {
      table.increments();
      table.integer('routineClassId').unsigned();
      table.string('day').notNullable();
      table.time('startTime').notNullable();
      table.integer('periods').notNullable();

      table.foreign('routineClassId').references('id').inTable('routine_classes').onDelete('cascade');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('class_times');
};
