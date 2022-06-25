const db = require("../../config/database");

const hasAccessInClass = async (req, res, next) => {

    let user = req.user;

    let {classId} = req.params;

    //check if class teacher
    if (user.userType === 'teacher') {
        let clas = await db('classes')
            .where({'teacherId': user.id, id: classId})
            .first();
        if (clas) {
            user.isTeacher = clas && true;
            return next();
        }


    } else if (user.userType === 'student') {
        let student = await db('classes')
            .join('class_students as cs', 'cs.classId', '=', 'classes.id')
            .where({'classes.id': classId, 'cs.studentId': user.id})
            .first();

        if (student) return next();
    }

    return res.status(401).json({message: 'Has not permission'});

}

module.exports = hasAccessInClass;