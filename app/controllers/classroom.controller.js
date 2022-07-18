const db = require("../../config/database");


const index = async (req, res) => {

    let {classId} = req.params;

    let cls = await db('classes')
        .select('classes.id', 'courses.name', 'courses.courseCode')
        .join('courses', 'courses.id', '=', 'classes.courseId')
        .where('classes.id', '=', classId)
        .first();

    if (!cls) {
        return res.json({status: 'failed'});
    }

    return res.json(cls);
}

const classes = async (req, res) => {

    let user = req.user;

    let activeRoutine = await db('routines')
        .where('isActive', '=', true)
        .first();

    console.log('active routine', activeRoutine);

    let routineQuery = db('classes')
        .join('class_participants as cp', 'cp.classId', '=', 'classes.id')
        .where('cp.userId', '=', user.id);

    //
    let activeClasses;
    let cls;

    if (activeRoutine) {
        activeClasses = await db('classes')
            .select('classes.id', 'courses.name as courseName', 'courses.courseCode')
            .join('class_participants as cp', 'cp.classId', '=', 'classes.id')
            .join('courses', 'courses.id', '=', 'classes.courseId')
            .where('cp.userId', '=', user.id).where('classes.routineId', '=', activeRoutine.id);
        cls = await db('classes')
            .select('classes.id', 'courses.name as courseName', 'courses.courseCode')
            .join('class_participants as cp', 'cp.classId', '=', 'classes.id')
            .join('courses', 'courses.id', '=', 'classes.courseId')
            .where('cp.userId', '=', user.id).whereNot('classes.routineId', '=', activeRoutine.id);
    } else {
        cls = await db('classes')
            .select('classes.id', 'courses.name as courseName', 'courses.courseCode')
            .join('class_participants as cp', 'cp.classId', '=', 'classes.id')
            .join('courses', 'courses.id', '=', 'classes.courseId')
            .where('cp.userId', '=', user.id);
    }

    return res.json({activeClasses: activeClasses, cls: cls});

}

module.exports = {
    index,
    classes
}