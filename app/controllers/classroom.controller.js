const db = require("../../config/database");
const Joi = require("joi");
const multer = require('multer');
const {faker} = require("@faker-js/faker");

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


const createPost = async (req, res) => {

    let {classId} = req.params;

    let user = req.user;

    let files = req.files;


    const schema = Joi.object({
        body: Joi.string().required()
    });

    const {value, error} = schema.validate(req.body);

    if (!error) {
        const trxProvider = db.transactionProvider();

        const trx = await trxProvider();

        try {
            let id = await trx('posts')
                .insert({...value, userId: user.id, classId: classId});

            for (let file of files) {
                await trx('attachments')
                    .insert({
                        name: file.filename,
                        ownerId: user.id,
                        path: file.path,
                        attachable: 'posts', attachableId: id[0]
                    })
            }

            trx.commit();

            return res.json({status: 'success', 'message': 'Post Successful'});

        } catch (er) {
            return res.json({status: 'failed', error: error})
        }


    } else {
        return res.json({status: 'failed', error: error})
    }


}

const getPosts = async (req, res) => {

    let {classId} = req.params;

    let {page} = req.query;

    if (!page) {
        page = 1;
    }

    const posts = await db('posts')
        .select('posts.*', 'users.firstName', 'users.lastName')
        .join('users', 'users.id', '=', 'posts.userId')
        .where('classId', '=', classId)
        .orderBy('posts.createdAt', 'desc')
        .paginate({perPage: 10, currentPage: page, isLengthAware: true});

    const {data} = posts;

    let postIds = data.map(item => item.id);

    const attachments = await db('attachments')
        .whereIn('attachableId', postIds)
        .where('attachable', '=', 'posts');

    data.map(item => {
        item.attachments = attachments.filter(i => i.attachableId === item.id);
        return item;
    });

    return res.json(posts);
}

//Attendances

const postAttendance = async (req, res) => {

    let {classId} = req.params;

    let {user} = req;

    if (!user.isMainTeacher) {
        return res.json({status: 'failed', message: 'Have not enough permission'});
    }

    let prevAtt = await db('class_attendances')
        .where('date', '=', date)
        .where('classId', '=', classId)
        .first();

    if (prevAtt) {
        return res.json({status: 'failed', message: 'Attendance Already Added for this date'});
    }

    const schema = Joi.object({
        date: Joi.string().required(),
        students: Joi.array().items({
            userId: Joi.required(),
            isAttend: Joi.required(),
        })
    });

    let {value, error} = schema.validate(req.body);

    if (!error) {

        let {students, date} = value;

        let data = students.map(student => {
            student.classId = classId;
            student.date = date;
            return student;
        })

        try {
            await db('class_attendances').insert(data);
            return res.json({status: 'success', message: 'Attendance Added successfully'});
        } catch (er) {
            return res.json({status: 'failed', message: er});
        }

    } else {
        return res.json({status: 'failed', message: error})
    }


}

const updateAttendance = async (req, res) => {

    let {user} = req;

    let {attId, classId} = req.params;

    const schema = Joi.object({
        isAttend: Joi.bool().required()
    })

    let {value, error} = schema.validate(req.body);

    if (!error) {

        const {isAttend} = value;

        try {
            await db('class_attendances as ca')
                .update({isAttend})
                .where({'ca.id': attId})

            return res.json({status: 'success', message: 'Update Successful'})

        } catch (er) {

        }
    }

}

const getAttendances = async (req, res) => {

    let attendances = await db('class_attendances as ca')
        .select('ca.id', 'users.id as userId', 'sd.studentId', 'users.firstName', 'users.lastName',
            'ca.isAttend', 'ca.date')
        .join('users', 'users.id', '=', 'ca.userId')
        .join('student_details as sd', 'sd.userId', '=', 'users.id')
        .orderBy('date');

    return res.json(attendances);

}

const getParticipants = async (req, res) => {

    let {classId} = req.params;
    let {type} = req.query;

    let dbQuery = db('class_participants as cp')
        .select('users.id', 'users.firstName', 'users.lastName',
            'sd.studentId')
        .join('users', 'users.id', '=', 'cp.userId')
        .join('student_details as sd', 'sd.userId', '=', 'users.id')
        .where('cp.classId', '=', classId);

    if (type) {
        dbQuery.where('users.userType', '=', type);
    }

    let participants = await dbQuery;

    return res.json(participants);

}

//assignments

const createAssignment = async (req, res) => {

    let {classId} = req.params;

    let user = req.user;

    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string(),
        points: Joi.number().allow(null).default(null),
        due: Joi.string().allow(null)
    });

    const {value, error} = schema.validate(req.body);

    console.log('user', user);

    if (!user.isMainTeacher) {
        return res.json({status: 'failed', message: 'You have not permission'});
    }

    if (!error) {

        try {
            await db('assignments')
                .insert({
                    ...value, classId: classId,
                    id: faker.random.alphaNumeric(10),
                    userId: user.id
                })
            return res.json({status: 'success', message: 'Assignment Added'});
        } catch (er) {
            return res.json({status: 'failed', message: er})
        }

    } else {
        return res.json({status: 'failed', message: error})
    }

}

const getAssignments = async (req, res) => {

    let {classId} = req.params;

    const assignments = await db('assignments')
        .where({classId: classId});

    return res.json(assignments);

}

const viewAssignment = async (req, res) => {

    let {a} = req.params;

    let assignment = await db('assignments as a')
        .select('a.id','a.title', 'a.description', 'a.points', 'a.due',
            'users.firstName', 'users.lastName'
            )
        .join('users', 'users.id', '=', 'a.userId')
        .where('a.id', '=', a)
        .first();

    if (!assignment) {
        return res.json({status: 'failed', message: 'Assignment Not Found'});
    }

    return res.json(assignment);

}

module.exports = {
    index,
    classes,
    createPost,
    getPosts,
    postAttendance,
    getParticipants,
    getAttendances,
    updateAttendance,
    createAssignment,
    getAssignments,
    viewAssignment
}