/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('semesters').del()
  await knex('semesters').insert([
    {id: 1, name: 'First Year First Semester'},
    {id: 2, name: 'First Year Second Semester'},
    {id: 3, name: 'Second Year First Semester'},
    {id: 4, name: 'Second Year Second Semester'},
    {id: 5, name: 'Third Year First Semester'},
    {id: 6, name: 'Third Year Second Semester'},
    {id: 7, name: 'Fourth Year First Semester'},
    {id: 8, name: 'Fourth Year Second Semester'},
  ]);
};
