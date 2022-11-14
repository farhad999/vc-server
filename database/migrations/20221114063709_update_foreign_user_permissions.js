
exports.up =  function(knex) {
   return knex.schema.table('user_permissions', table=> {
       table.dropForeign('userId', 'user_permissions_userid_foreign');
       table.foreign('userId').references('id')
           .inTable('admin_users').onDelete('cascade');
   })
};

exports.down = function(knex) {

};
