exports.up = function(knex) {
  return knex.schema.createTable('messages', (table)=>{
      table.string('id');
      table.text('body').notNullable();
      table.integer('senderId').unsigned();
      table.string('conversationId');
      table.timestamps({useCamelCase: true, defaultToNow: true})

      table.foreign('senderId').references('id')
          .inTable('users').onDelete('cascade');

      table.foreign('conversationId').references('id')
          .inTable('conversations').onDelete('cascade');
  })
};


exports.down = function(knex) {
  return knex.schema.dropTable('messages');
};
