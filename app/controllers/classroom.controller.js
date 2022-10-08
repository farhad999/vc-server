const db = require("../../config/database");
const Joi = require("joi");
const multer = require('multer');
const {faker} = require("@faker-js/faker");
const fs = require("fs");
const postService = require('../services/post.service')

const index = async (req, res) => {

    let {classId} = req.params;

    let {user} = req;

    let cls = await db('classes')
        .select('classes.id', 'courses.name', 'courses.courseCode')
        .join('courses', 'courses.id', '=', 'classes.courseId')
        .where('classes.id', '=', classId)
        .first();

    if (!cls) {
        return res.json({status: 'failed'});
    }

    return res.json({cls:cls, user: {isMainTeacher: user.isMainTeacher, userType: user.userType}});
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

    await postService.createPost(req, res, 'class', 'classId');

}

const getPosts = async (req, res) => {
   await postService.getPosts(req, res, 'class', 'classId');
}

//Attendances

const postAttendance = async (req, res) => {

    let {classId} = req.params;

    let {user} = req;

    if (!user.isMainTeacher) {
        return res.json({status: 'failed', message: 'Have not enough permission'});
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

        let prevAtt = await db('class_attendances')
            .where('date', '=', date)
            .where('classId', '=', classId)
            .first();

        if (prevAtt) {
            return res.json({status: 'failed', message: 'Attendance Already Added for this date'});
        }

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
            'sd.studentId', 'users.userType')
        .join('users', 'users.id', '=', 'cp.userId')
        .leftJoin('student_details as sd', 'sd.userId', '=', 'users.id')
        .where('cp.classId', '=', classId);

    if (type) {
        dbQuery.where('users.userType', '=', type);
    }

    let participants = await dbQuery;

    return res.json(participants);

}

//assignments

const createOrUpdateAssignment = async (req, res) => {

    let {classId} = req.params;

    let user = req.user;

    const schema = Joi.object({
        id: Joi.string().optional(),
        title: Joi.string().required(),
        description: Joi.string(),
        points: Joi.number().allow(null).default(null),
        due: Joi.string().allow(null),
        attachments: Joi.array().items({
            id: Joi.number().optional(),
            size: Joi.number(),
            name: Joi.string(),
            path: Joi.string(),
        })
    });


    const {value, error} = schema.validate(req.body);

    if (!user.isMainTeacher) {
        return res.json({status: 'failed', message: 'You have not permission'});
    }

    if (!error) {

        const {attachments, id, ...rest} = value;

        const trxProvider = db.transactionProvider();

        const trx = await trxProvider();

        try {

            if (id) {
                await trx('assignments')
                    .update({
                        ...rest,
                    }).where('id', '=', id);

                for (let att of attachments) {

                    if (att.id) {

                        await trx('attachments')
                            .update({name: att.name, path: att.path})
                            .where('id', '=', att.id);


                    } else {

                        await trx('attachments')
                            .insert({
                                name: att.name,
                                path: att.path,
                                size: att.size,
                                attachable: 'assignment',
                                attachableId: id,
                                ownerId: user.id
                            });
                    }

                }

            } else {

                let id = faker.random.alphaNumeric(10)

                await trx('assignments')
                    .insert({
                        ...rest, classId: classId,
                        id: id,
                        userId: user.id
                    })

                let students = await trx('class_participants as cp')
                    .select('users.id')
                    .join('users', 'users.id', '=', 'cp.userId')
                    .where('cp.classId', '=', classId)
                    .where('users.userType', '=', 'student');

                let assignData = students.map(st => ({
                    assignmentId: id,
                    assignedTo: st.id,
                }))

                console.log('ass', assignData);

                await trx('assignment_students')
                    .insert(assignData);

                for (let att of attachments) {

                    await trx('attachments')
                        .insert({
                            name: att.name,
                            path: att.path,
                            size: att.size,
                            attachable: 'assignment',
                            attachableId: id,
                            ownerId: user.id
                        });

                }

            }

            trx.commit();

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

    let {user} = req;

    let assignmentQuery = db('assignments as a')
        .select('a.id', 'a.title', 'a.description', 'a.points', 'a.due',
            'users.firstName', 'users.lastName',
        )
        .join('users', 'users.id', '=', 'a.userId')

        .where('a.id', '=', a);

    if (user.userType === 'student') {
        assignmentQuery.select('as.status')
            .join('assignment_students as as', 'as.assignmentId', '=', 'a.id')
            .where('as.assignedTo', '=', user.id)
    }

    const assignment = await assignmentQuery.first();

    if (!assignment) {
        return res.status(404).json({message: 'Assignment Not Found'});
    }

    let attachments = await db('attachments as a')
        .where('a.attachableId', '=', assignment.id)
        .where('a.attachable', '=', 'assignment');

    let studentAttachments = null;

    if (user.userType === 'student') {
        studentAttachments = await db('attachments as a')
            .where('a.attachableId', '=', assignment.id)
            .where('a.attachable', '=', 'student_work')
            .where('a.ownerId', '=', user.id);
    }

    if (!assignment) {
        return res.json({status: 'failed', message: 'Assignment Not Found'});
    }

    assignment.attachments = attachments;

    assignment.studentAttachments = studentAttachments;

    return res.json(assignment);

}

const deleteAssignment = async (req, res) => {
    let {a} = req.params;

    const trxProvider = db.transactionProvider();

    const trx = await trxProvider();

    /*et attachments = await db('attachments')
        .where('attachableId', '=', a)
        .where('attachable', '=', 'assignments');*/


    try {
        await trx('assignments')
            .where('id', '=', a)
            .delete();

        let attachments = await trx('attachments')
            .where('attachable', '=', 'assignments')
            .where('attachableId', '=', a);

        for (let att of attachments) {

            try {
                fs.unlinkSync(att.path);

            } catch (er) {
                trx.rollback();
                return res.json({status: 'failed', message: er});
            }
            await trx('attachments')
                .where({id: att.id})
                .delete();


        }
        trx.commit();
        return res.json({status: 'success', message: 'Delete Successful'});

    } catch (er) {
        return res.json({status: 'failed', message: er});
    }

}

const submitClassWork = async (req, res) => {
    const {classId, a} = req.params;

    let {user} = req;

    if (user.userType !== 'student') {
        return res.json({status: 'failed', message: 'Only Students can submit classswork'});
    }

    const {files} = req.body;

    const attachableFiles = files.map(file => {
        file.attachableId = a;
        file.attachable = 'student_work';
        file.ownerId = user.id;
        return file;
    })

    const trxProvider = db.transactionProvider();

    const trx = await trxProvider();


    try {
        await trx('assignment_students')
            .update({status: 'submitted'})
            .where('assignedTo', '=', user.id);

        await trx('attachments')
            .insert(attachableFiles);

        trx.commit();

        return res.json({status: 'success', message: 'Submitted'})

    } catch (er) {
        trx.rollback();
        return res.json({status: 'failed', message: er});
    }

}

const getClassWorkSubmissions = async (req, res) => {

    const {classId, a} = req.params;

    try {
        let submissions = await db('assignment_students as as')
            .select('users.id', 'sd.studentId', 'users.firstName', 'users.lastName', 'as.status')
            .join('users', 'users.id', '=', 'as.assignedTo')
            .join('student_details as sd', 'sd.userId', '=', 'users.id')
            .where('as.assignmentId', '=', a);

        return res.json(submissions);
    } catch (er) {
        return res.send({status: 'failed', message: er})
    }
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
    createOrUpdateAssignment,
    getAssignments,
    viewAssignment,
    deleteAssignment,
    submitClassWork,
    getClassWorkSubmissions
}
