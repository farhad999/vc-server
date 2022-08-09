const db = require("../../config/database");

const hasAccessInClass = async (req, res, next) => {

    let user = req.user;

    let {classId} = req.params;

    let cls = await db('classes')
        .where('id', '=', classId)
        .first();

    if(!cls){
        return res.status(404).send("Class Not found!");
    }

    const participant = await db('classes')
        .join('class_participants as cp', 'cp.classId', '=', 'classes.id')
        .where({'classes.id': classId, 'cp.userId': user.id})
        .first();

    if (!participant) {
        return res.status(401).json({message: 'You are not participant of this class'});
    }


    //check if class teacher
    if (user.userType === 'teacher') {
        let clas = await db('classes')
            .where({'teacherId': user.id, id: classId})
            .first();
        if (clas) {
            user.isMainTeacher = !!clas;
        }

    }
    return next();


}

module.exports = hasAccessInClass;