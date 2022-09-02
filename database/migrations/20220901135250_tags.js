exports.up = function(knex) {
    return knex.schema.createTable('tags', table=> {
        table.string('id').primary();
        table.string('name');
        table.string('slug');
        table.string('morphType');
        table.string('morphId');

    })
};


exports.down = function(knex) {
  return knex.schema.dropTable('tags');
};
