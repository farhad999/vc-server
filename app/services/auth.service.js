const authConfig = require('../../config/auth.config');
const db = require('../../config/database');
const Joi = require("joi");
const tokenService = require("./token.service");

const authAttempt = async (loginData, guard = 'default') => {

    const schema = Joi.object({
        email: Joi.string().email({minDomainSegments: 2}).required(),
        password: Joi.string().required()
    });

    let {error, value} = schema.validate(loginData);

    let {email, password} = value;

    let token;

    if (!error) {

        let authType = authConfig.find(item => item.guard === guard);

        let user = await db(authType.table)
            .where({email, password})
            .first();

        if (user) {
            token = await tokenService.generateToken(user.id);
        } else {
            error = "Email or Password Incorrect";
        }
    }


    return [error, token];
}

const getAuthUser = async (userId, guard = 'default') => {

    let authType = authConfig.find(item => item.guard = guard);

    return db(authType.table)
        .select("id", "firstName", 'lastName', "email")
        .where({id: userId})
        .first();
}

module.exports = {
    authAttempt,
    getAuthUser,
}