/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('permissions').del()
  await knex('permissions').insert([
    {name: 'admin.view'},
  ]);
};
