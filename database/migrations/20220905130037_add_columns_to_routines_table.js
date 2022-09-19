
exports.up = function(knex) {
  return knex.schema.table('routines', table=> {
      table.enum('type', ['simple', 'priority']).notNullable();
      table.dateTime('publish').nullable();
      table.string('semesters').notNullable();
      table.string('offDays').notNullable();
      table.time('endTime').notNullable();
      table.string('breakTime').notNullable();
  })
};

exports.down = function(knex) {

};
