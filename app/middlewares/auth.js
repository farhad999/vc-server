const tokenService = require('../services/token.service');
const authService = require('../services/auth.service');

const auth = (guard = 'default') =>{

return async (req, res, next) => {

    const [verified, error] = await tokenService.verifyToken(req, guard);

    if (verified) {
        req.user = await authService.getAuthUser(verified.userId, guard);
        return next();
    } else {
        // Access Denied
        return res.status(401).json({message: error.message});
    }

}
}

module.exports = auth;
