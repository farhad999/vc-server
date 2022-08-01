/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('assignments', (table)=> {
      table.string('id').primary();
      table.string('classId');
      table.string('title').notNullable();
      table.text('description');
      table.dateTime('due');
      table.integer('points');

      table.integer('userId').unsigned();

      table.foreign('classId').references('id').inTable('classes')
          .onDelete('cascade');

      table.foreign('userId').references('id').inTable('users')
          .onDelete('cascade');

  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
