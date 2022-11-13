const authConfig = require('../../config/auth.config');
const db = require('../../config/database');
const Joi = require("joi");
const tokenService = require("./token.service");
const hashService = require('./hash.service');

const authAttempt = async (loginData, guard = 'default') => {

    const schema = Joi.object({
        email: Joi.string().email({minDomainSegments: 2}).required(),
        password: Joi.string().required()
    });

    let {error:validationError, value} = schema.validate(loginData);

    let {email, password} = value;

    let token;

    let error;

    if (!validationError) {

        let authType = authConfig.find(item => item.guard === guard);

        let user = await db(authType.table)
            .where({email: email})
            .first();

        if (user) {

            let dbPass = user.password;
            let checked = hashService.compare(password, dbPass);

            if (checked) {
                token = await tokenService.generateToken(user.id, guard)
            }else{
                error="Password is incorrect";
            }
        } else {
            error = "No account found with this email";
        }
    }

    return [error, token, validationError];
}

const getAuthUser = async (userId, guard = 'default') => {

    let authType = authConfig.find(item => item.guard === guard);

    let selectableField = ['id', 'firstName', 'lastName', 'email'];

    if(guard === "default"){
        selectableField.push('userType');
    }

    return db(authType.table)
        .select(selectableField)
        .where({id: userId})
        .first();
}

const logout = async (req) => {
    return await tokenService.invalidateToken(req);
}

module.exports = {
    authAttempt,
    getAuthUser,
    logout
}
