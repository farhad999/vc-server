
exports.up = function(knex) {
  return knex.schema.table('semesters', table=> {
      table.float('totalCredits').notNullable();
  })
};


exports.down = function(knex) {

};
