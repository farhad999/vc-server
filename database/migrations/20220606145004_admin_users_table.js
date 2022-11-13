exports.up = function(knex) {
  return knex.schema.createTable('admin_users', table=> {
    table.increments('id');
    table.string('firstName');
    table.string('lastName');
    table.string('email');
    table.text('password');
    table.timestamps({useCamelCase: true, defaultToNow: true});
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('admin_users');
};
