const Joi = require("joi");
const authService = require('../../services/auth.service')
const permissionService = require("../../services/permission.service");

const login = async (req, res) => {

    let [er, token, validationError] = await authService.authAttempt(req.body, 'admin');

    console.log('token', token);

    if (!validationError)
        if (!er) {
            return res.json({status: 'success', token});
        } else {
            return res.json({status: 'failed', message: er});
        }
    else {
        return res.json({status: 'failed', message: validationError.message})
    }

}

module.exports = {
    login
}
