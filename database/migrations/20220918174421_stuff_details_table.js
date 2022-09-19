exports.up = function(knex) {
  return knex.schema.createTable('stuff_details', table => {
      table.increments();
      table.integer('userId').unsigned();
      table.bigInteger('designationId').unsigned();
      table.date('joiningDate');
      table.timestamps({defaultToNow: true, useCamelCase: true});

      table.foreign('userId').references('id')
          .inTable('users').onDelete('cascade');
      table.foreign('designationId').references('id')
          .inTable('designations').onDelete('cascade');
  })
};


exports.down = function(knex) {
  return knex.schema.dropTable('stuff_details');
};
