const Joi = require("joi");
const db = require("../../config/database");
const moment = require("../../config/moment");
const {faker} = require("@faker-js/faker");
const routineService = require('../services/routine.service');
const logger = require('../../config/logger');

const createOrUpdateRoutine = async (req, res) => {

    let monthYear = moment().format('MMMM-YYYY');

    const schema = Joi.object({
        id: Joi.number().optional(),
        name: Joi.string().default(monthYear),
        status: Joi.string().default('draft'),
        startTime: Joi.string().required(),
        isActive: Joi.bool().default(false),
        periodLength: Joi.number().required(),
        type: Joi.string().valid('simple', 'priority').default('simple'),
        offDays: Joi.string().required(),
        semesters: Joi.string().required(),
        endTime: Joi.string().required(),
        breakTime: Joi.string().required(),
    });

    let {error, value} = schema.validate(req.body);

    if (!error) {

        let {id, ...rest} = value;

        try {

            if (id) {
                await db('routines')
                    .update(value)
                    .where({id: id});

                return res.json({status: 'success', message: 'Routine Updated'});
            } else {
                await db('routines')
                    .insert(rest);
                return res.json({status: 'success', message: 'Routine Created'});
            }


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

const activateOrDeactivate = async (req, res) => {
    let {routineId} = req.params;

    let activeRoutine = await db('routines')
        .where({isActive: true})
        .first();

    let routine = await db('routines')
        .where('id', '=', routineId)
        .first();

    if (routine.status !== 'final') {
        return res.json({status: 'failed', message: 'Make Routine Final'})
    }

    //first deactivate the active routine
    if (activeRoutine) {
        await db('routines').update({isActive: false}).where('id', activeRoutine.id);
    }
    //  console.log('routineId', typeof routineId, 'acitve', activeRoutine.id);

    if (!activeRoutine || routine.id !== activeRoutine?.id) {

        await db('routines').update({isActive: true}).where('id', routineId);
        return res.json({status: 'success', 'message': 'Activated Successfully'});
    }

    return res.json({status: 'success', message: 'Deactivate Successfully'});
}

const deleteRoutine = async (req, res) => {

    let {routineId} = req.params;

    let routine = await db('routines')
        .where({id: routineId})
        .first();

    if (!routine) {
        return res.status(404).json({status: 'Routine Not Found'});
    }

    try {

        await db('routines')
            .where({id: routineId})
            .delete();

        return res.json({status: 'success', message: 'Routine Deleted Successful'});

    } catch (er) {
        return res.status(500).json({message: er});
    }

}

const addClassTimeOne = async (req, res) => {
    let {routineId} = req.params;

    let routine = await db('routines')
        .where({id: routineId})
        .first();

    if (!routine) {
        return res.json({status: 'failed', error: 'Routine Not found'});
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
        id: Joi.string().optional(),
        courseId: Joi.number().required(),
        teacherId: Joi.number().required(),
        times: Joi.array().items({
            id: Joi.number(),
            day: Joi.string().required(),
            startTime: Joi.string().required(),
            periods: Joi.string().required(),
        })
    });

    let {error, value} = schema.validate(req.body);

    if (!error) {

        let {courseId, teacherId, times, id} = value;

        //check if course exists

        let course = await db('courses')
            .where({id: courseId})
            .first();

        if (!course) {
            return res.json({status: 'failed', error: 'Course does not exists'})
        }

        //check is teacherId is exists

        let isTeacherExists = await db('users')
            .where({userType: 'teacher', id: teacherId})
            .first();

        if (!isTeacherExists) {
            return res.json({status: 'failed', error: "Teacher is not exists"});
        }

        //check if class already added in this routine

        let cls = await db('classes')
            .where({courseId: courseId, routineId: routineId})
            .first();

        //class exists then append class times

        let classId = "";

        if (cls) {

            //now check class times

            classId = cls.id;

            let classTimes = await db('class_times')
                .where('classId', '=', cls.id);

            if (!id && classTimes.length + times.length > course.credit) {
                return res.json({
                    status: 'failed',
                    message: 'Number of class times can not be more than course credits!'
                })
            }

        }


        //Time Overlap check

        let timeExists = false;

        for (let time of times) {

            let classesInTheDayQuery = db('classes')
                .select('classes.id', 'ct.day as day', 'ct.startTime',
                    'ct.periods')
                .join('class_times as ct', 'ct.classId', '=', 'classes.id')
                .join('courses', 'courses.id', '=', 'classes.courseId')
                .where({
                    'ct.day': time.day, 'classes.routineId': routineId,
                    'courses.semesterId': course.semesterId
                });

            if (time.id) {
                classesInTheDayQuery.whereNot('ct.id', '=', time.id);
            }

            const classesInTheDay = await classesInTheDayQuery;

            for (let cls of classesInTheDay) {

                let dbTimeRange = moment.rangeFromInterval('minutes', cls.periods * routine.periodLength, moment(cls.startTime, 'HH:mm:ss'));

                let inputTimeRange = moment.rangeFromInterval('minutes', time.periods * routine.periodLength, moment(time.startTime, 'HH:mm'));

                if (dbTimeRange.overlaps(inputTimeRange)) {
                    timeExists = true;
                }

            }

            if (timeExists) {
                return res.json({status: 'failed', message: 'Time overlap! Please Check your time'});
            }

        }

        //Todo do not add students or teacher as participants until publish

        const trxProvider = db.transactionProvider();

        const trx = await trxProvider();

        try {

            if (!cls) {
                classId = faker.random.alphaNumeric(10);
                await trx('classes')
                    .insert({id: classId, routineId, teacherId, courseId});
            }

            if (id) {
                //update

                //update time

                try {

                    let time = times[0];

                    let {id, ...rest} = time;

                    await trx('class_times').update(rest).where('id', '=', id);

                    let cls1 = await db('classes')
                        .where('id', '=', id)
                        .first();

                    if (cls1.courseId !== courseId) {
                        //that mean course code needs to be updated
                        //but class for that course might not be created

                        //class for the course is available
                        //cls find by courseId
                        if (cls) {
                            //now update the classId of this time
                            await trx('class_times')
                                .update({classId: cls.id})
                                .where('id', '=', time.id);

                        } else {
                            //now crate the class

                            let clsId = faker.random.alphaNumeric(6);

                            await trx('classes')
                                .insert({teacherId, courseId, id: clsId});

                            await trx('class_times')
                                .update({classId: clsId})
                                .where('id', '=', time.id);

                        }
                    } else {
                        await trx('classes')
                            .update({teacherId, courseId})
                            .where({id: classId});
                    }
                } catch (er) {
                    console.log('er', er)
                }

                trx.commit();

                return res.json({status: 'success', message: 'Updated'});

            } else {
                let timesWithClass = times.map((item => ({...item, classId: classId})));

                await trx('class_times').insert(timesWithClass);

                trx.commit();
            }


            return res.json({status: 'success', message: 'Class created'});

        } catch (error) {
            trx.rollback();
            return res.status(500).json({status: 'failed', error: error});
        }

    } else {
        return res.json({status: 'failed', error: error});
    }

}

const updateClass = async (req, res) => {

    let {classId, routineId} = req.params;

    let routine = await db('routines')
        .where({id: routineId})
        .first();

    let class1 = await db('classes')
        .where({id: classId})
        .first();

    if (!class1) {
        return res.json({status: 'failed', error: 'Class does not exists'});
    }

    let schema = Joi.object({
        courseId: Joi.number().required(),
        teacherId: Joi.number().required(),
        times: Joi.array().items({
            id: Joi.number().required(),
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

        //check is teacherId is exists

        let isTeacherExists = await db('users')
            .where({userType: 'teacher', id: teacherId})
            .first();

        if (!isTeacherExists) {
            return res.json({status: 'failed', error: "Teacher is not exists"});
        }

        /* let [isValid, error] = routineService.isTimeValid(times);

         if (!isValid) {
             return res.json({status: 'failed', error: error})
         }*/

        if (!await routineService.isTimeOverlap(times, course, routine)) {
            return res.json({status: 'failed', error: 'Time Overlap! Please check your class time'})
        }

        let dbDays = await db('class_times')
            .where({classId: classId});

        const trxProvider = db.transactionProvider();

        const trx = await trxProvider();

        try {

            await trx('classes')
                .update({teacherId, courseId})
                .where({id: classId});

            if (dbDays.length === times.length) {
                for (let item of times) {

                    await trx('class_times')
                        .update({day: item.day, startTime: item.startTime, endTime: item.endTime})
                        .where('id', '=', item.id)
                        .where('classId', '=', classId);

                }
            } else {
                await trx('class_times')
                    .where({classId: classId})
                    .delete();

                let timesWithClass = times.map((item => ({...item, classId: classId})));

                await trx('class_times').insert(timesWithClass);

            }

            trx.commit();

            return res.json({status: 'success', message: 'Class Updated'});

        } catch (error) {
            trx.rollback();
            return res.json({status: 'failed', error: error});
        }


    } else {
        return res.json({status: 'failed', error: error})
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

    routine.semesters = await db('semesters')
        .select('id', 'shortName', 'name')
        .whereIn('id', routine.semesters.split(','));

    res.json({routine, classes});

}

const getClassInfo = async (req, res) => {

    let {routineId, courseId} = req.params;

    let cls = await db('classes')
        .select('classes.id', 'users.id as teacherId', 'users.firstName', 'users.lastName')
        .join('users', 'users.id', '=', 'classes.teacherId')
        .where('classes.courseId', '=', courseId)
        .where('routineId', routineId)
        .first();

    if (!cls) {
        return res.status(404).json('not found');
    }

    return res.json(cls);
}

module.exports = {
    createOrUpdateRoutine,
    getRoutines,
    deleteRoutine,
    addClass,
    viewRoutine,
    updateClass,
    activateOrDeactivate,
    getClassInfo,
}