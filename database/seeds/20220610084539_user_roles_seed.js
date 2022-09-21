const hashPassword = require('../../app/services/hash.service');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.seed = async function (knex) {
    // Deletes ALL existing entries

    //Todo unexpected error during seed

    let user = await knex('users').insert({
        firstName: 'Admin',
        lastName: 'Admin',
        userType: 'stuff',
        email: 'admin@gmail.com',
        password: hashPassword.hash('admin123'),
    });

    let role = await knex('roles').where('name', '=', 'SuperAdmin').first();

    await knex('user_roles').insert(
        [
            {userId: user[0], roleId: role.id},
        ]
    );
};
