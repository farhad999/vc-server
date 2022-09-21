/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    //await knex('semesters').del()
    await knex('semesters').insert([
        {name: 'First Year First Semester', 'shortName': '1-1', totalCredits: '17.5'},
        {name: 'First Year Second Semester', shortName: '1-2', totalCredits: '19'},
        {name: 'Second Year First Semester', shortName: '2-1', totalCredits: '22'},
        {name: 'Second Year Second Semester', shortName: '2-2', totalCredits: '21'},
        {name: 'Third Year First Semester', shortName: '3-1', totalCredits: '23'},
        {name: 'Third Year Second Semester', shortName: '3-2', totalCredits: '20'},
        {name: 'Fourth Year First Semester', shortName: '4-1', totalCredits: '18'},
        {name: 'Fourth Year Second Semester', shortName: '4-2', totalCredits: '17'},
    ]);
};
