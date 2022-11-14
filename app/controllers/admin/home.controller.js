const db = require('../../../config/database')

const index = async (req, res) => {

    let userCounts = await db('users')
        .select('userType', (cb)=>cb.count('id').as('count'))
        .groupBy('userType');

    let totalCourse = await db('courses')
        .select((cb)=>cb.count('id').as('count'));

    let totalSemesters = await db('semesters')
        .select((cb)=>cb.count('id').as('count'));

    res.json({counts: userCounts, totalCourses: totalCourse[0].count,
        totalSemesters: totalSemesters[0].count})
}

module.exports = {
    index
}
