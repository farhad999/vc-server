/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('user_permissions', (table) => {
      table.increments();
      table.integer('userId').unsigned();
      table.integer('permissionId').unsigned();

      table.foreign('userId').references('id').inTable('users').onDelete('cascade');
      table.foreign('permissionId').references('id').inTable('permissions').onDelete('cascade');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
