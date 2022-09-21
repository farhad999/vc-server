const db = require("../../config/database");
const Joi = require("joi");
const index = async (req, res) => {
    let semesters = await db('semesters');
    res.json(semesters);
}

const createOrUpdate = async (req, res) => {

    const schema = Joi.object({
        id: Joi.number().optional(),
        name: Joi.string().required(),
        shortName: Joi.string().required(),
        totalCredits: Joi.number().required(),
    });

    const {error, value} = schema.validate(req.body);

    if (!error) {

        try {

            let {id, ...rest} = value;

            if (id) {
                await db('semesters')
                    .update(value)
                    .where('id', '=', id)

                return res.json({status: 'success', message: 'Semester Updated'})
            } else {
                await db('semesters')
                    .insert(value);

            }

            return res.json({status: 'success', message: 'Semester Added'});

        } catch (er) {
            return res.status(500).send({message: error.message})
        }

    } else {
        return res.json({status: 'failed', message: 'Validataion Failed :' + error.message})
    }

}


const deleteSemester = async (req, res) => {
    let {id} = req.params;

    let semester = await db('semesters')
        .where('id', id).first();

    if (!semester) {
        return res.json({status: 'failed', message: 'Semester not found'})
    }

    //find usages of this semester

    let students = await db('users')
        .join('student_details as sd', 'sd.userId', '=', 'users.id')
        .where('sd.semesterId', '=', semester.id);

    if (students.length > 0) {
        return res.json({status: 'failed', 'message': 'Delete Failed! Some students are in this semester'});
    }

    let courses = await db('courses')
        .where('semesterId', '=', semester.id);

    if (courses.length > 0) {
        return res.json({status: 'failed', message: 'Some courses are in this semester'});
    }

    //perform delete

    await db('semesters')
        .delete()
        .where('id', '=', id);

    return res.json({status: 'success', message: 'Delete Successful'})


}

module.exports = {
    index,
    createOrUpdate,
    deleteSemester,
}
