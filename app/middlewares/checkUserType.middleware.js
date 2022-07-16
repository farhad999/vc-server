const checkUserType =  (userType) => {
    return (req, res, next) => {

        let user = req.user;

        if (userType.some(item => item === user.userType)) return next();

        return res.status(401).json({message: 'Has not enough permission'})

    }
}

module.exports = checkUserType;