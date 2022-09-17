
exports.up = function(knex) {
  return knex.migrate.table('semesters', table=> {
      table.float('totalCredits').notNullable();
  })
};


exports.down = function(knex) {
  
};
