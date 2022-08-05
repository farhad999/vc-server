/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('attachments', (table)=> {
      table.increments();
      table.string('name');
      table.string('path');
      //table in which attached
      table.string('attachable');
      table.string('attachableId');
      table.integer('ownerId').unsigned();
      table.timestamps({useCamelCase: true, defaultToNow: true});

      table.foreign('ownerId').references('id').inTable('users')
          .onDelete('cascade');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
