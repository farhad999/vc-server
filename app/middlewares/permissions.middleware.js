const permissionService = require('../services/permission.service')

const hasPermission = (perm, userTypes) => {
    return async (req, res, next) => {

        let user = req.user;

        if (await permissionService.hasPermission(perm, user)) {
            return next();
        }

        if(userTypes && userTypes.includes(user.userType)){
            return next();
        }
        return res.status(403).json('Do not have enough permission');

    }
}


module.exports = hasPermission;

