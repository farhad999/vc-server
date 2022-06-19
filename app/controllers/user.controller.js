const db = require('../../config/database');
const Joi = require('joi');
const hashPassword = require('../services/hash.service')

const store = async (req, res) => {

    let schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email({minDomainSegments: 2}).required(),
        password: Joi.string(),
        userType: Joi.string().required(),
        details: Joi.object(),
    })

    let {error, value} = schema.validate(req.body);

    if (!error) {
        let {userType, details, firstName, lastName, email, password} = value;

        //protect duplicate email

        let user = await db('users')
            .where({email: email});

        if(user){
            return res.json({status: 'failed', message: 'User already registered with this email'});
        }

        switch (userType) {

            case "student": {

                let studentSchema = Joi.object({
                    studentId: Joi.string().required(),
                    session: Joi.string().required(),
                    semesterId: Joi.string().required(),
                })

                let {error, value} = studentSchema.validate(details);

                if (!error) {

                    password = hashPassword.hash(password);

                    try {
                        await db.transaction(async trx => {


                            const inserts = await trx('users').insert({
                                firstName: firstName,
                                lastName: lastName,
                                email: email,
                                password: password,
                                userType: userType,
                            })

                            await trx('student_details')
                                .insert({...value, userId: inserts[0]},);

                            return res.json({status: 'success', 'message': 'Added Successfully'})
                        })

                    } catch (error) {

                        return res.json({status: 'failed', error: error});
                    }


                }

            }
        }

    }

}

module.exports = {
    store
}