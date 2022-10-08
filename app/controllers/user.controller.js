const db = require('../../config/database');
const Joi = require('joi');
const hashPassword = require('../services/hash.service')

const index = async (req, res) => {

    let {type, page, perPage, q, semesterId, designationId} = req.query;

    if (!page) {
        page = 1;
    }

    if (perPage) {
        perPage = 10;
    }

    let userQuery = db('users')
        .select('users.id', 'users.firstName', 'users.lastName', 'users.email')
        .where('users.userType', '=', type)
        .whereNull('users.deletedAt')
        .orderBy('users.createdAt', 'desc');

    if (type === 'student') {
        userQuery.select( 'sd.studentId', 'semesters.name as semesterName', '' +
            'semesters.id as semesterId', 'sessions.id as sessionId', 'sessions.name as session').leftJoin('student_details as sd', 'sd.userId', '=', 'users.id')
            .join('semesters', 'semesters.id', '=', 'sd.semesterId')
            .join('sessions', 'sessions.id', '=', 'sd.sessionId')
        ;
        //only for student
        if(semesterId){
            userQuery.where('semesters.id', '=', semesterId);
        }

    } else {
        userQuery.select('designations.name as designationName', 'designations.id as designationId',
            'designations.rank', 'sd.joiningDate')
            .leftJoin('stuff_details as sd', 'sd.userId', '=', 'users.id')
            .join('designations', 'designations.id', '=', 'sd.designationId');

        if(designationId){
            userQuery.where('designations.id', '=', designationId);
        }
    }

    if (q) {
        userQuery.whereILike('firstName', q + '%')
            .orWhereILike('lastName', q + '%')
    }

    let users = await userQuery.paginate({perPage: perPage, currentPage: page, isLengthAware: true});

    return res.json(users);

};

const store = async (req, res) => {

    let schema = Joi.object({
        id: Joi.number().optional(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email({minDomainSegments: 2}).required(),
        password: Joi.string().when('id', {is: Joi.exist(), then: Joi.disallow(), otherwise: Joi.required()}),
        userType: Joi.string().required(),
        studentId: Joi.string().optional(),
        sessionId: Joi.number().when('studentId', {is: Joi.exist(), then: Joi.required(), otherwise: Joi.optional()}),
        semesterId: Joi.number().when('studentId', {is: Joi.exist(), then: Joi.required(), otherwise: Joi.optional()}),
        designationId: Joi.number(),
        joiningDate: Joi.string(),
    })

    let {error, value} = schema.validate(req.body);


    if (!error) {

        let {id, userType, firstName, lastName, email} = value;

        //protect duplicate email

        let user = await db('users')
            .where({email: email})
            .first();

        if (id) {
            //then update user data
            if (!user) {
                return res.json({status: 'failed', message: 'Update Failed User does not exist'});
            }

            try {
                await db.transaction(async trx => {

                    await trx('users').update({
                        firstName: firstName,
                        lastName: lastName,
                        email: email
                    }).where({id});

                    if (value.hasOwnProperty('studentId')) {

                        let {studentId, sessionId, semesterId} = value;

                        await trx('student_details')
                            .update({studentId, sessionId, semesterId})
                            .where({userId: id});

                    }

                    if (userType === 'teacher' || userType === 'stuff') {
                        let {designationId, joiningDate} = value;
                        await trx('stuff_details')
                            .update({designationId, joiningDate})
                            .where('userId', '=', user.id);
                    }

                    return res.json({status: 'success', 'message': 'Updated Successfully'})
                })

            } catch (error) {

                return res.json({status: 'failed', error: error});
            }

        } else {
            //insert user data

            if (user) {
                return res.json({status: 'failed', message: 'User Already exists with this email'});
            }

            let password = hashPassword.hash(value.password);

            try {
                await db.transaction(async trx => {

                    const inserts = await trx('users').insert({
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        password: password,
                        userType: userType,
                    })

                    if (value.hasOwnProperty('studentId')) {

                        let {studentId, sessionId, semesterId} = value;

                        await trx('student_details')
                            .insert({studentId, sessionId, semesterId, userId: inserts[0]});

                    }

                    if (userType === 'teacher' || userType === 'stuff') {
                        let {designationId, joiningDate} = value;
                        await trx('stuff_details')
                            .insert({designationId, joiningDate, userId: inserts[0]});
                    }

                    return res.json({status: 'success', 'message': 'Added Successfully'})
                })

            } catch (error) {

                return res.json({status: 'failed', error: error});
            }

        }


    } else {
        return res.json({status: 'failed', error: error})
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
    deleteUser,
    index,
}
