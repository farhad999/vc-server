const db = require("../../config/database");

const getClassmates = async (req, res) => {

    const user = req.user;

    if(user.userType !== 'student'){
        return res.status(403).json({message: 'Only Student can view this page'});
    }

    const userSession = await db('student_details as sd')
        .select('sessions.id as sessionId')
        .join('sessions', 'sessions.id', '=', 'sd.sessionId')
        .where('sd.userId', '=', user.id)
        .first();

    const mates = await db('users')
        .select('users.id', 'users.firstName', 'users.lastName', 'users.email')
        .join('student_details as sd', 'sd.userId', '=', 'users.id')
        .join('sessions', 'sessions.id', '=', 'sd.sessionId')
        .where('sessions.id', '=', userSession.sessionId);

    return res.json(mates);
}

module.exports = {
    getClassmates,
}
