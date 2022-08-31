
exports.up = function(knex) {
  return knex.schema.createTable('questions', table => {
    table.string('id').primary();
    table.text('description');
    table.string('title').notNullable();
    table.timestamps({defaultToNow: true, useCamelCase: true});
    table.string('morphType');
    table.string('morphId');
    table.integer('userId').unsigned();

    table.foreign('userId').references('id')
        .inTable('users').onDelete('cascade');

  })
};


exports.down = function(knex) {
  return knex.schema.dropTable('questions');
};
