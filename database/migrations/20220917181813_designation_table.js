
exports.up = function(knex) {
  return knex.schema.createTable('designations', table => {
      table.bigIncrements();
      table.string('name');
      //rank lower is higher
      table.integer('rank');
      table.timestamps({useCamelCase: true, defaultToNow: true});
  })
};


exports.down = function(knex) {
    return knex.schema.dropTable('designations');
};
