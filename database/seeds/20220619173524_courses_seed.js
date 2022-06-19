/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('courses').del()
  await knex('courses').insert([
    {name: 'Computer Fundamental', 'courseCode': 'CSE-1101', credit: 3.00, semesterId: 1},
  ]);
};
