
exports.up = function(knex) {
  return knex.schema.createTable('conversation_participants', (table)=> {
      table.string('id', 30).primary();
      table.integer('userId').unsigned();
      table.string('conversationId');
      table.timestamps({defaultToNow: true, useCamelCase: true})

      table.foreign('userId').references('id')
          .inTable('users').onDelete('cascade');

      table.foreign('conversationId').references('id')
          .inTable('conversations').onDelete('cascade');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('conversation_participants');
};
