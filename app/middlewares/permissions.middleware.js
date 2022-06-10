const permissionService = require('../services/permission.service')

const hasPermission = (perm) => {
    return async (req, res, next) => {

        let user = req.user;

        if (await permissionService.hasPermission(perm, user)) {
            return next();
        }

        return res.json('Do not have enough permission');

    }
}


module.exports = hasPermission;

