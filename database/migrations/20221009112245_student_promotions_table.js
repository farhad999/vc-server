
exports.up = function(knex) {
  return knex.schema.createTable('student_promotions', table=> {
         table.increments('id');
         table.integer('userId').unsigned();
         table.integer('sessionFrom').unsigned();
         table.integer('sessionTo').unsigned();
         table.integer('semesterFrom').unsigned();
         table.integer('semesterTo').unsigned();
         table.timestamps({defaultToNow: true, useCamelCase: true});

         table.foreign('userId').references('id')
             .inTable('users').onDelete('cascade');

         table.foreign('sessionFrom').references('id')
             .inTable('sessions').onDelete('cascade');

         table.foreign('sessionTo').references('id')
             .inTable('sessions').onDelete('cascade');

         table.foreign('semesterFrom').references('id')
             .inTable('semesters').onDelete('cascade');

         table.foreign('semesterTo').references('id')
             .inTable('semesters').onDelete('cascade');

  })
};


exports.down = function(knex) {
  return knex.schema.dropTable('student_promotions');
};
