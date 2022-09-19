/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('courses', (table) => {
      table.increments();
      table.string('name');
      table.string('courseCode');
      table.string('credit');
      table.integer('semesterId').unsigned();
      table.timestamp('deletedAt').nullable();

      table.foreign('semesterId').references('id').inTable('semesters')
          .onDelete('cascade');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('courses');
};
