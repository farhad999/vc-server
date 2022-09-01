exports.up = function(knex) {
  return knex.schema.createTable('answers', table => {
      table.string('id').primary();
      table.text('body');
      table.string('questionId');
      table.integer('userId').unsigned();
      table.timestamps({useCamelCase: true, defaultToNow: true});

      table.foreign('questionId').references('id')
          .inTable('questions').onDelete('cascade');

      table.foreign('userId').references('id')
          .inTable('users').onDelete('cascade');
  })
};


exports.down = function(knex) {
  return knex.schema.dropTable('answers');
};
