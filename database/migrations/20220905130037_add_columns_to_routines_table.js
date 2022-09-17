
exports.up = function(knex) {
  return knex.schema.table('routines', table=> {
      table.enum('type', ['simple', 'priority']).notNullable();
      table.dateTime('publish').nullable();
      table.string('semesters').required();
      table.string('offDays').required();
      table.time('endTime').required();
      table.string('breakTime').required();
  })
};

exports.down = function(knex) {
  
};
