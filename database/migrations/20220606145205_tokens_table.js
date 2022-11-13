exports.up = function(knex) {
  return knex.schema.createTable('tokens', (table)=> {
    table.increments();
    table.text('token').notNullable();
    table.integer('userId').unsigned();
    table.string('guard').notNullable();
    table.boolean('isBlackListed').defaultTo(false);
    table.timestamps();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tokens');
};
