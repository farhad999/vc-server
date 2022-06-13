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

    let {error, value} = schema.validate(loginData);

    let {email, password} = value;

    let token;

    if (!error) {

        let authType = authConfig.find(item => item.guard === guard);

        let user = await db(authType.table)
            .where({email: email})
            .first();

        let dbPass = user.password;
        let checked = hashService.compare(password, dbPass);

        if (user && checked) {
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

const logout = async (req) => {
    return await tokenService.invalidateToken(req);
}

module.exports = {
    authAttempt,
    getAuthUser,
    logout
}