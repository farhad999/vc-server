const Joi = require('joi');
const authService = require('../services/auth.service');
const permissionService = require('../services/permission.service')

const login = async (req, res) => {

    let [error, token] = await authService.authAttempt(req.body);

    if (token) {
        return res.json({status: 'success', token: token});
    }

    return res.json({status: 'failed', error: error});

}

const getUser = async (req, res) => {

    const user = req.user;

    if (user.guard === 'admin') {
        let [role, permissions] = await permissionService.getUserPermissions(user.id);

        user.role = role;
        user.permissions = permissions;
    }

    res.json({user: user});
}

const logout = async (req, res) => {

    let [status, error] = await authService.logout(req);

    if (status === 'success') {
        res.json({status: status, message: 'Logged Out Successful'})
    } else {
        return res.json({status: 'failed', message: 'Log Out Error'});
    }

}

module.exports = {
    login,
    getUser,
    logout
}
