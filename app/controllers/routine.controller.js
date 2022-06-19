const Joi = require("joi");
const db = require("../../config/database");
const moment = require("moment");

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

    if(!page){
        page = 1;
    }

    const routines = await db('routines')
        .orderBy('createdAt', 'desc')
        .whereNull('deletedAt')
        .paginate({perPage: 10, currentPage: page});

    return res.json(routines);
}


module.exports = {
    createRoutine,
    getRoutines
}