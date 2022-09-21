/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex('user_permissions').del()
    /*
    await knex('user_permissions').insert([
      {userId: 2, permissionId:1},
    ]);

     */
};
