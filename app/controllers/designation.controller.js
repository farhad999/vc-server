const Joi = require("joi");
const logger = require('../../config/logger')
const db = require("../../config/database");

const index = async (req, res) => {
    const designations = await db('designations')
        .select('id', 'name', 'rank')
        .orderBy('rank');

    return res.json(designations);
}

const store = async (req, res) => {
    const schema = Joi.object({
       id: Joi.number().optional(),
       name: Joi.string().required(),
       rank: Joi.number().required(),
    });

    const {value, error} = schema.validate(req.body);

    if(!error){

        let {id, ...rest} = value;

        if(id){
            //update
            await db('designations')
                .update(value)
                .where('id', '=', id);
            return res.json({status: 'success', message: 'Designation Updated'});
        }

        try{
            await db('designations')
                .insert(value);

            return res.json({status: 'success', message: 'Designation Added'})
        }catch (er){
            return res.status(500).send(er.message);
        }


    }else{
        logger.error('data is not valid');
        return res.json({status: 'failed', 'message': 'data is not valid'})
    }
}

const deleteItem = async (req, res) => {
    let {id} = req.params;

    let designation = await db('designations')
        .where('id', '=', id).first();

    if(!designation){
        return res.json({status: 'failed'})
    }

    //Todo check existance of user before perform delete operations
}

module.exports = {
    store,
    index,
    deleteItem,
}
