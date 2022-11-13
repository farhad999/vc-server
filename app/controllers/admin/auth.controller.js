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

const getUser = async (req, res) => {

    const user = req.user;

    /*let [role, permissions] = await permissionService.getUserPermissions(user.id);

    user.role = role;
    user.permissions = permissions;*/

    res.json({user: user});
}

const logout = async (req, res) => {
    let [status, error] = await authService.logout(req);
    if(error){
        return res.json({status: 'failed', message: error.message})
    }
    return res.json({status: 'success', message: 'Logout Successful'});
}

module.exports = {
    login,
    getUser,
    logout,
}
