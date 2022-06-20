const Joi = require("joi");
const db = require("../../config/database");
const moment = require("../../config/moment");
const {faker} = require("@faker-js/faker");

const createRoutine = async (req, res) => {

    let monthYear = moment().format('MMMM-YYYY');

    const schema = Joi.object({
        name: Joi.string().default(monthYear),
        status: Joi.string().default('final'),
        startTime: Joi.string().required(),
        isActive: Joi.bool(),
        periodLength: Joi.string().required(),
    });

    let {error, value} = schema.validate(req.body);

    if (!error) {

        let activeRoutine = await db('routines')
            .where({isActive: value.isActive})
            .first();

        if(activeRoutine){
            return res.json({status: 'failed', message: 'Only one can be active at a time'});
        }

        try {
            await db('routines')
                .insert(value);

            return res.json({status: 'success', message: 'Routine Created'});
        } catch (er) {
            return res.json({status: 'failed', error: er});
        }
    } else {
        return res.json({status: 'failed', error: error});
    }

}

const getRoutines = async (req, res) => {

    let {page} = req.query;

    if (!page) {
        page = 1;
    }

    const routines = await db('routines')
        .orderBy('createdAt', 'desc')
        .whereNull('deletedAt')
        .paginate({perPage: 10, currentPage: page});

    return res.json(routines);
}

const update = async (req, res) => {

    let {routineId} = req.params;

    const schema = Joi.object({
        name: Joi.string().required(),
        status: Joi.string().required()
    });

    let {error, value} = schema.validate(req.body);

    // return  res.json({er: error});

    if (!error) {

        let routine = await db('routines')
            .where({id: routineId})
            .first();

        if (!routine) {
            return res.json({status: 'failed', error: 'Routine Not Found'});
        }

        //check time overlap


        try {
            await db('routines')
                .update(value)
                .where({id: routineId});

            return res.json({status: 'success', message: 'Routine Updated'});
        } catch (er) {
            return res.json({status: 'failed', error: er});
        }
    } else {
        return res.json({status: 'failed', error: error});
    }

}

const deleteRoutine = async (req, res) => {

    let {routineId} = req.params;

    let routine = await db('routines')
        .where({id: routineId})
        .first();

    if (!routine) {
        return res.json({status: 'failed', error: 'Routine Not Found'});
    }

    try {

        await db('routines')
            .update({deletedAt: new Date(Date.now())})
            .where({id: routineId});

        return res.json({status: 'success', message: 'Routine Deleted Successful'});

    } catch (er) {
        return res.json({status: 'failed', error: er});
    }

}

const addClass = async (req, res) => {

    let {routineId} = req.params;

    let routine = await db('routines')
        .where({id: routineId})
        .first();

    if (!routine) {
        return res.json({status: 'failed', error: 'Routine Not found'});
    }

    let schema = Joi.object({
        courseId: Joi.number().required(),
        teacherId: Joi.number().required(),
        times: Joi.array().items({
            day: Joi.string().required(),
            startTime: Joi.string().required(),
            periods: Joi.string().required(),
        })
    });

    let {error, value} = schema.validate(req.body);

    if (!error) {

        let {courseId, teacherId, times} = value;

        //check if course exists

        let course = await db('courses')
            .where({id: courseId})
            .first();

        if (!course) {
            return res.json({status: 'failed', error: 'Course does not exists'})
        }

        //check if class already added in this routine

        let classExistsInCurrentRoutine = await db('classes')
            .where({courseId: courseId, routineId: routineId})
            .first();

        if (classExistsInCurrentRoutine) {
            return res.json({status: 'failed', error: "This course already added in current Routine"});
        }

        //check is teacherId is exists

        let isTeacherExists = await db('users')
            .where({userType: 'teacher', id: teacherId})
            .first();

        if (!isTeacherExists) {
            return res.json({status: 'failed', error: "Teacher is not exists"});
        }


        //Time Overlap check

        let timeExists = false;

        for (let time of times) {

            let classesInTheDay = await db('classes')
                .select('classes.id', 'ct.day as day', 'ct.startTime',
                    'ct.periods')
                .join('class_times as ct', 'ct.classId', '=', 'classes.id')
                .join('courses', 'courses.id', '=', 'classes.courseId')
                .where({
                    'ct.day': time.day, 'classes.routineId': routineId,
                    'courses.semesterId': course.semesterId
                });

            for (let cls of classesInTheDay) {

                let dbTimeRange = moment.rangeFromInterval('minutes', cls.periods * routine.periodLength, moment(cls.startTime, 'HH:mm:ss'));

                let inputTimeRange = moment.rangeFromInterval('minutes', time.periods * routine.periodLength, moment(time.startTime, 'HH:mm'));

                if (dbTimeRange.overlaps(inputTimeRange)) {
                    timeExists = true;
                }

            }

            if (timeExists) {
                return res.json({status: 'failed', error: 'Time overlap! Please Check your time'});
            }

        }

        let students = await db('courses')
            //.join('semesters', 'semesters.id', '=', 'courses.semesterId')
            .select('users.id')
            .join('student_details as sd', 'sd.semesterId', '=', 'courses.semesterId')
            .join('users', 'users.id', '=', 'sd.userId')
            .where({'users.userType': 'student', 'courses.id': courseId});


        let classId = faker.random.alphaNumeric(10);

        const trxProvider = db.transactionProvider();

        const trx = await trxProvider();

        try {

            await trx('classes')
                .insert({id: classId, routineId, teacherId, courseId});

            let studentWithClass = students.map((item => ({studentId: item.id, classId: classId})));

            await trx('class_students').insert(studentWithClass);

            let timesWithClass = times.map((item => ({...item, classId: classId})));

            await trx('class_times').insert(timesWithClass);

            trx.commit();

            return res.json({status: 'success', message: 'Class created'});

        } catch (error) {
            trx.rollback();
            return res.json({status: 'failed', error: error});
        }

    } else {
        return res.json({status: 'failed', error: error});
    }

}

const viewRoutine = async (req, res) => {

    let {routineId} = req.params;

    let {semesterId} = req.query;

    let routine = await db('routines')
        .where({id: routineId})
        .first();

    if (!routine) {
        return res.json({status: 'failed', error: 'Routine Not Found'});
    }

    let classQuery = db('classes')

        .join('courses', 'courses.id', '=', 'classes.courseId')
        .join('semesters', 'semesters.id', '=', 'courses.semesterId')
        .join('class_times as ct', 'ct.classId', '=', 'classes.id')
        .join('users', 'users.id', '=', 'classes.teacherId')
        .where({'classes.routineId': routineId});

    if (semesterId) {
        classQuery.where('semesters.id', '=', semesterId);
    }

    let classes = await classQuery.select('courses.name as courseName',
        'classes.id',
        'courses.id as courseId',
        'users.id as teacherId',
        'courses.courseCode',

        'users.firstName as teacherFirstName',
        'users.lastName as teacherLastName',
        'semesters.shortName',
        'semesters.name as semesterName',
        'ct.day as day', 'ct.startTime', 'ct.periods',
        'ct.id as classTimeId'
    )

    res.json(classes);

}


module.exports = {
    createRoutine,
    getRoutines,
    update,
    deleteRoutine,
    addClass,
    viewRoutine
}