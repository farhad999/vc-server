const checkUserType =  (userType) => {
    return (req, res, next) => {

        let user = req.user;

        if (userType.some(item => item === user.userType)) return next();

        return res.json({status: 'failed', error: 'You have not enough permission'});

    }
}

module.exports = checkUserType;