const Joi = require('joi');
const authService = require('../services/auth.service');

const login = async (req, res) => {

    let [error, token] = await authService.authAttempt(req.body);

    if (token) {
        return res.json({status: 'success', token: token});
    }
    return res.json({status: 'failed', error: error});

}

const getUser = async (req, res) => {

    const user = req.user;

    res.json({user: user});
}

module.exports = {
    login,
    getUser
}