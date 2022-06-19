const db = require('../../config/database');
const Joi = require('joi');
const hashPassword = require('../services/hash.service')

const index = async (req, res) => {

    let {type, page, perPage} = req.query;

    if (!page) {
        page = 1;
    }

    if (perPage) {
        perPage = 10;
    }

    let userQuery = db('users')
        .select('users.id', 'users.firstName', 'users.lastName', 'users.email')
        .where({userType: type})
        .whereNull('deletedAt')
        .orderBy('createdAt', 'desc')

    if (type === 'student') {
        userQuery.select('sd.session', 'sd.studentId', 'semesters.name as semesterName', '' +
            'semesters.id as semesterId').leftJoin('student_details as sd', 'sd.userId', '=', 'users.id')
            .join('semesters', 'semesters.id', '=', 'sd.semesterId');
    }

    let users = await userQuery.paginate({perPage: perPage, currentPage: page, isLengthAware: true});

    return res.json(users);

};

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

        if (user) {
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
const update = async (req, res) => {

    let schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email({minDomainSegments: 2}).required(),
        details: Joi.object(),
    })

    let {error, value} = schema.validate(req.body);

    let {id} = req.params;


    if (!error) {

        let {details, firstName, lastName, email} = value;

        let user = await db('users')
            .where({id})
            .first();

        if (!user) {
            return res.json({status: 'failed', message: 'No User found with this email'});
        }

        switch (user.userType) {

            case "student": {

                let studentSchema = Joi.object({
                    studentId: Joi.string().required(),
                    session: Joi.string().required(),
                    semesterId: Joi.string().required(),
                });

                let {error, value} = studentSchema.validate(details);

                if (!error) {

                    try {

                        await db.transaction(async trx => {

                            await trx('users').update({
                                firstName: firstName,
                                lastName: lastName,
                                email: email,
                            }).where({id});

                            await trx('student_details')
                                .update({...value})
                                .where({userId: id});

                            return res.json({status: 'success', 'message': 'Updated Successfully'})
                        })

                    } catch (error) {

                        return res.json({status: 'failed', error: error});
                    }


                } else {
                    return res.json({er: error});
                }

            }
        }

    } else {
        return res.json({status: 'error', error: error});
    }

}

const deleteUser = async (req, res) => {
    let {id} = req.params;

    try {
        await db('users')
            .where({id})
            .update({deletedAt: new Date(Date.now())});

        return res.json({status: 'success', message: 'Deleted Successful'});

    } catch (er) {
        return res.json({status: 'failed', error: er})
    }

}

module.exports = {
    store,
    update,
    deleteUser,
    index,
}