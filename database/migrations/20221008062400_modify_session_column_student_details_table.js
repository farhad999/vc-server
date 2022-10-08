
exports.up = function(knex) {
  return knex.schema.alterTable('student_details', table=> {
      table.dropColumn('session');
      table.integer('sessionId').unsigned();

      table.foreign('sessionId').references('id')
          .inTable('sessions').onDelete('cascade')
  })
};


exports.down = function(knex) {

};
