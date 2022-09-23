const db = require('../../config/database');
const Joi = require("joi");

const index = async (req, res) => {

    //sn = semester short name

    let {page, q, sn, semesterId, paginate} = req.query;


    if (!page) {
        page = 1;
    }

    let dbQuery = db('courses')
        .select('courses.id', 'courses.name', 'courseCode', 'credit', 'semesterId', 'semesters.shortName')
        .join('semesters', 'semesters.id', '=', 'courses.semesterId')
        .whereNull('courses.deletedAt')
        .orderBy('courses.id', 'desc');

    //where Like case-sensitive
    //whereILike case-insensitive
    if (q) {
        dbQuery.where((query) => {
            query.whereILike('courseCode', `${q}%`)
                .orWhereILike('courses.name', `%${q}%`)
        })

    }

    if (sn) {
        dbQuery.where('semesters.shortName', '=', sn);
    }

    if (semesterId) {
        dbQuery.where("courses.semesterId", '=', semesterId);
    }

    if (paginate === 'false') {
        return res.json(await dbQuery);
    }


    const data = await dbQuery.paginate({perPage: 10, isLengthAware: true, currentPage: page});
    return res.json(data);


}

const store = async (req, res) => {

    const schema = Joi.object({
        name: Joi.string().required(),
        courseCode: Joi.string().required(),
        credit: Joi.number(),
        semesterId: Joi.number(),
    });

    let {error, value} = schema.validate(req.body);

    if (!error) {
        try {
            await db('courses')
                .insert(value);
            return res.json({status: 'success', message: 'Course Added'});
        } catch (er) {
            return res.json({status: 'failed', error: error});
        }
    } else {
        return res.json({status: 'failed', error: error});
    }

}

const update = async (req, res) => {

    const schema = Joi.object({
        name: Joi.string().required(),
        courseCode: Joi.string().required(),
        credit: Joi.number(),
        semesterId: Joi.number(),
    });

    let {courseId} = req.params;

    let {error, value} = schema.validate(req.body);

    if (!error) {
        try {
            await db('courses')
                .update(value)
                .where({id: courseId});

            return res.json({status: 'success', message: 'Course Updated'});
        } catch (er) {
            return res.json({status: 'failed', error: error});
        }
    } else {
        return res.json({status: 'failed', error: error});
    }

}

const deleteCourse = async (req, res) => {
    //soft delete
    let {courseId} = req.params;

    try {
        await db('courses')
            .where({id: courseId})
            .update({deletedAt: new Date(Date.now())})

        return res.json({status: 'success', message: 'Delete Successfully'});

    } catch (er) {
        return res.json({status: 'failed', error: er})
    }

}

module.exports = {
    store,
    update,
    index,
    deleteCourse
}

