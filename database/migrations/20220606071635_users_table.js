/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', (table)=> {
      table.increments();
      table.string('name');
      table.string('email');
      table.text('password');
      table.enum('userType',['stuff', 'teacher', 'student']);
      table.timestamps();
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
