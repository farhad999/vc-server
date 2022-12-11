/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("routine_classes", (table) => {
    table.increments("id");
    table.integer("courseId").unsigned();
    table.integer("teacherId").unsigned();
    table.integer("routineId").unsigned();
    table.time("startTime");
    table.string("day");
    table.integer("periods");
    table.timestamps({ defaultToNow: true, useCamelCase: true });

    table
      .foreign("courseId")
      .references("id")
      .inTable("courses")
      .onDelete("cascade");
    table
      .foreign("teacherId")
      .references("id")
      .inTable("users")
      .onDelete("cascade");
    table
      .foreign("routineId")
      .references("id")
      .inTable("routines")
      .onDelete("cascade");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
