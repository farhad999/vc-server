
exports.up = function(knex) {
  return knex.schema.createTable('conversations',(table)=> {
      table.string('id').primary();
      //single or group
      table.string('type');
      table.string('name');
      table.string('morphType');
      //type  groupId, or null
      table.string('morphId');
      table.timestamps({defaultToNow: true, useCamelCase: true});
  })
};


exports.down = function(knex) {
  return knex.schema.dropTable('conversations');
};
