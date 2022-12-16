exports.up = function (knex) {
  return knex.schema.createTable("class_updates", (table) => {
    table.increments("id");
    table.integer("routineClassId").unsigned();
    table.dateTime("date");
    //status = updated, postponed
    table.string("status");

    table.foreign('routineClassId').references('routineClassId')
    .inTable('routine_classes').onDelete('cascade');

  });
};

exports.down = function (knex) {};
