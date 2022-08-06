/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("assignment_students", (table)=> {
      table.increments();
      table.string('assignmentId');
      table.string('status').defaultTo('assigned');
      table.integer('assignedTo').unsigned();
      table.timestamps({defaultToNow: true, useCamelCase: true});

      table.foreign('assignmentId').references('id')
          .inTable('assignments').onDelete('cascade');

      table.foreign('assignedTo').references('id')
          .inTable('users').onDelete('cascade');


  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('assignment_students');
};
