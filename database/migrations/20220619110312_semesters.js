/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('semesters', (table) => {
      table.increments();
      table.string('name').notNullable();
      table.string('shortName').notNullable();
      table.string('year');
      table.string('semester');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('semesters');
};
