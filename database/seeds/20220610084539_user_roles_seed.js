/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex('user_roles').del()
    await knex('user_roles').insert([
        {userId: 1, roleId: 1},
        {userId: 3, roleId: 2}
    ]);
};
