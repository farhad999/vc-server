const db = require('../../config/database');
const Joi = require("joi");

const index = async (req, res) => {

    let {page, q, semesterId} = req.query;


    if (!page) {
        page = 1;
    }

    let dbQuery = db('courses')
        .select('id', 'name', 'courseCode', 'credit', 'semesterId')
        .whereNull('deletedAt')
        .orderBy('id', 'desc');

    //where Like case-sensitive
    //whereILike case-insensitive
    if (q) {
        dbQuery.whereILike('courseCode', `${q}%`)
            .orWhereILike('name', `%${q}%`)
    }

    if(semesterId){
        dbQuery.where("semesterId", '=', semesterId);
    }

    const data = await dbQuery.paginate({perPage: 10, isLengthAware: true, currentPage: page});

    return res.send(data);
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

