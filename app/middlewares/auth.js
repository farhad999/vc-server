const tokenService = require('../services/token.service');
const authService = require('../services/auth.service');

const auth = async (req, res, next) => {

    const [verified, error] = await tokenService.verifyToken(req, 'bearer');

    if (verified) {

        req.user = await authService.getAuthUser(verified.userId);

        return next();
    } else {
        // Access Denied
        return res.status(401).send('UnAuthorized');
    }

}

module.exports = auth;
