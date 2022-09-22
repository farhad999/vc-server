exports.up = function(knex) {
    return knex.schema.createTable('sessions', table => {
        table.increments('id');
        table.string('name');
        table.timestamp('deletedAt').nullable();
        table.timestamps({defaultToNow: true, useCamelCase: true})
    })
};

exports.down = function(knex) {
  return knex.schema.dropTable('sessions');
};
