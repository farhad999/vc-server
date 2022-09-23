const db = require("../../config/database");

const index = async (req, res) => {

    const user = req.user;

    //show priority based unpublished routines to the teacher

    const routine = await db('routines')
        .where('type', '=', 'priority')
        .whereNull('publish')
        .orderBy('id', 'desc')
        .first();

    return res.json({routine: routine});
}

module.exports = {
    index
}
