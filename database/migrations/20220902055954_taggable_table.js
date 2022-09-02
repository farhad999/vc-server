
exports.up = function(knex) {
  return knex.schema.createTable('taggables', table=> {
        table.string('id').primary();
        table.string('morphType');
        table.string('morphId');
        table.string('tagId');
        table.timestamps({useCamelCase:true, defaultToNow: true});

        table.foreign('tagId').references('id')
            .inTable('tags').onDelete('cascade');
  })
};


exports.down = function(knex) {
  return knex.schema.dropTable('taggables')
};
