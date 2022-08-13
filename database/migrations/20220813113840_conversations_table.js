
exports.up = function(knex) {
  return knex.schema.createTable('conversations',(table)=> {
      table.string('id').primary();
      table.string('type');
      //type id userId, groupId, or null
      table.string('typeId');
      table.timestamps({defaultToNow: true, useCamelCase: true});
  })
};


exports.down = function(knex) {
  return knex.schema.dropTable('conversations');
};
