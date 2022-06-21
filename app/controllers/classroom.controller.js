const db = require("../../config/database");

const index = async (req, res) => {

    let {classId} = req.params;

    let class1 = await db('classes')
        .where('id', '=', classId)
        .first();

    if(!class1){
        return res.json({status: 'failed'});
    }

    return res.json({status: 'success', message: class1});
}

module.exports = {
    index
}