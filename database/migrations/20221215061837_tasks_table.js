exports.up = function (knex) {
  return knex.schema.createTable( 'tasks',(table) => {
    table.increments();
    table.text('content');
    table.date("date");
    table.integer("userId").unsigned();
    table.boolean('isComplete').default(false);
    table
      .foreign("userId")
      .references("id")
      .inTable("users")
      .onDelete("cascade");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tasks");
};
