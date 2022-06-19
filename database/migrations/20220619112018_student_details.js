/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("student_details", (table)=> {
        table.increments('id');
        table.integer('userId').unsigned();
        table.string('studentId').notNullable();
        table.string('session');
        table.integer('semesterId').unsigned();

        table.foreign('semesterId').references('id').inTable('semesters').onDelete('cascade');
        table.foreign('userId').references('id').inTable('users').onDelete('cascade');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('student_details');
};
