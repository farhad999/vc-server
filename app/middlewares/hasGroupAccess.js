
const Group = require('../models/Group');

const hasGroupAccess = async (req, res, next)=> {

    let {id} = req.params;

    const group = await Group.query().findById(id);

    if(!group){
        return res.status(404).send('Group Not found');
    }

    let user = req.user;

    if(user.id === group.adminId){
        user.isAdmin = true;
        user.adminId = user.id;
    }

    next();
}

module.exports = hasGroupAccess;