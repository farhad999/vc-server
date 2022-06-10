/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_roles', (table) => {
      table.increments();
      table.integer('userId').unsigned();
      table.integer('roleId').unsigned();

      table.foreign('userId').references('id').inTable('users').onDelete('cascade');
      table.foreign('roleId').references('id').inTable('roles').onDelete('cascade');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
