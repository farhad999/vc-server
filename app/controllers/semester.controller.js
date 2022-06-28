const db = require("../../config/database");
const index = async (req, res) => {
    let semesters = await db('semesters');

    res.json({semesters: semesters});

}

module.exports = {
    index
}