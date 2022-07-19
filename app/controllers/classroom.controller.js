const db = require("../../config/database");
const Joi = require("joi");


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

    const schema = Joi.object({
        body: Joi.string().required()
    });

    const {value, error} = schema.validate(req.body);

    if (!error) {
        await db('posts')
            .insert({...value, userId: user.id, classId: classId})
    }

    return res.json({status: 'success', 'message': 'Post Successful'});

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
        .paginate({perPage: 10, currentPage: page, isLengthAware: true,});

    return res.json(posts);
}

module.exports = {
    index,
    classes,
    createPost,
    getPosts
}