/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del()
  await knex('users').insert([
    {name: 'stuff', email: 'stuff@gmail.com', password: 'stuff', userType: 'stuff'},
    {name: 'student', email: 'student@gmail.com', password: 'student', userType: 'student'},
    {name: 'teacher', email: 'teacher@gmail.com', password: 'teacher', userType: 'teacher'},
  ]);
};
