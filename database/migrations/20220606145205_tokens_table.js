/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tokens', (table)=> {
    table.increments();
    table.text('token').notNullable();
    table.integer('userId').unsigned();
    table.boolean('isBlackListed').defaultTo(false);
    table.timestamps();

    table.foreign('userId').references('id').inTable('users');

  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('tokens');
};
