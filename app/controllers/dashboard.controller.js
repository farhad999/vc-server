const db = require("../../config/database");

const index = async (req, res) => {

    const user = req.user;

    //show priority based unpublished routines to the teacher

    const routine = await db('routines')
        .where('type', '=', 'priority')
        .whereNull('publish')
        .orderBy('id', 'desc')
        .first();

    //logged In student information

    const student = await db('student_details')
    .join('users', 'users.id', '=', 'student_details.userId')
    .where('users.id', '=', user.id)
    .first();

    const classQuery =  db('routine_classes as rc')
    .join('routines', 'routines.id', '=', 'rc.routineId')
    .join('users', 'users.id', '=', 'rc.teacherId')
    .join('courses', 'courses.id', '=', 'rc.courseId')
    .where('routines.isActive', true)

    if(user.userType === 'student'){
        classQuery.where('courses.semesterId', '=', student.semesterId)
    }else if(user.userType === 'teacher'){
        classQuery.where('rc.teacherId', '=', user.id)
    }

    const classes = await classQuery.select('courses.name as courseName',
    'courses.courseCode',
    'users.firstName as teacherFirstName', 
    'users.lastName as teacherLastName', 'rc.day', 'rc.startTime',);

    const assignments = await db('assignments')
    .join('assignment_students as as', 'as.assignmentId', '=', 'assignments.id')
    .where('as.assignedTo', '=', user.id);

    return res.json({routine: routine, classes, assignments});
}

module.exports = {
    index
}
