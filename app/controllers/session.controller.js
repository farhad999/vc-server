const db = require("../../config/database");
const Joi = require("joi");
const moment = require("moment");

const index = async (req, res) => {
    let sessions = await db('sessions')
        .select('id', 'name')
        .whereNull('deletedAt')
        .orderBy('name', 'desc');

    return res.json(sessions);

}

const createOrUpdate = async (req, res) => {
    const schema = Joi.object({
        id: Joi.number().optional(),
        name: Joi.string().required(),
    })

    const {value, error} = schema.validate(req.body);

    if (!error) {

        let {id, ...rest} = value;

        let session = await db('sessions')
            .where('name', '=', value.name)
            .whereNull('deletedAt')
            .first();

        if(session){
            return  res.json({status: 'failed', message: 'Session already exists with this name'})
        }

        try {

            if (id) {
                await db('sessions')
                    .update(rest)
                    .where("id", '=', id);

                return res.json({status: 'success', 'message': 'Updated'})
            } else {

                await db('sessions')
                    .insert(rest);

                return res.json({status: 'success', message: 'Added'})
            }

        } catch (er) {
            return res.status(500).send('Server Error' + er.message);
        }

    } else {
        return res.json({status: 'failed', 'message': error.message});
    }
}


const deleteSession = async (req, res) => {
    let {id} = req.params;

    let session = await db('sessions')
        .where('id', '=', id)
        .first();

    if(!session){
        return res.json({status: 'failed',message: 'Session Not Found'})
    }

    //perform delete

    try {
        await db('sessions')
            .update({deletedAt: moment().format('YYYY-MM-DD HH:mm:ss')})
            .where('id', '=', id);

        return res.json({status: 'success', message: 'session deleted'})
    }catch (er){
        return res.status(500).send('server error', er.message);
    }

}

module.exports = {
    createOrUpdate,
    deleteSession,
    index,
}
