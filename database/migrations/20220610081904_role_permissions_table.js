/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('role_permissions', (table) => {
      table.increments();
      table.integer('roleId').unsigned();
      table.integer('permissionId').unsigned();

      table.foreign('roleId').references('id').inTable('roles').onDelete('cascade');
      table.foreign('permissionId').references('id').inTable('permissions').onDelete('cascade');

  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('role_permissions');
};
