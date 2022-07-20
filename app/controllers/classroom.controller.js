const db = require("../../config/database");
const Joi = require("joi");
const multer = require('multer');

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

module.exports = {
    index,
    classes,
    createPost,
    getPosts
}