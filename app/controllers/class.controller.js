const db = require("../../config/database");
const moment = require('moment')

const index = async (req, res) => {
  
    const user = req.user;

    const {date} = req.query;

    const momentDate = moment(date, 'YYYY-MM-DD');

    console.log({day: momentDate.format('ddd')})

  //logged In student information

  const classQuery = db("routine_classes as rc")
    .join("routines", "routines.id", "=", "rc.routineId")
    .join("users", "users.id", "=", "rc.teacherId")
    .join("courses", "courses.id", "=", "rc.courseId")
    .whereILike('rc.day', momentDate.format('ddd'))
    .where("routines.isActive", true);

  if (user.userType === "student") {
    const student = await db("student_details")
      .join("users", "users.id", "=", "student_details.userId")
      .where("users.id", "=", user.id)
      .first();

    classQuery.where("courses.semesterId", "=", student.semesterId);
  } else if (user.userType === "teacher") {
    classQuery.where("rc.teacherId", "=", user.id);
  }

  const classes = await classQuery.select(
    "courses.name as courseName",
    "courses.courseCode",
    "users.firstName as teacherFirstName",
    "users.lastName as teacherLastName",
    "rc.day",
    "rc.startTime"
  );

  return res.send({ classes });
};

module.exports = {
  index,
};
