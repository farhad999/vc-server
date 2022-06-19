/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("routines", (table)=> {
    table.increments();
    table.string('name');
    table.string('status');
    table.integer('periodLength').notNullable();
    table.time('startTime').notNullable();
    table.timestamps({useCamelCase: true, defaultToNow: true});
    table.timestamp('deletedAt');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('routines');
};
