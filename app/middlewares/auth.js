const tokenService = require('../services/token.service');
const authService = require('../services/auth.service');

const auth = (guard = 'default', strict = true) => {

    return async (req, res, next) => {

        const [verified, error] = await tokenService.verifyToken(req, guard);

        //if not strict mode then return any auth user
        //strict=true return user for specific guard

        if (verified) {
            if (!strict) {
                req.user = await authService.getAuthUser(verified.userId, verified.guard);
                req.user.guard = verified.guard;
                return next();
            } else {
                if (guard === verified['guard']) {
                    req.user = await authService.getAuthUser(verified.userId, verified.guard);
                    req.user.guard = verified.guard;
                    return next();
                } else {
                    return res.status(401).json({message: error.message});
                }
            }
        } else {
            // Access Denied
            return res.status(401).json({message: error.message});
        }

    }
}

module.exports = auth;
