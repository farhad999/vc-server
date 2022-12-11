const Joi = require("joi");
const db = require("../../config/database");
const moment = require("../../config/moment");
const { faker } = require("@faker-js/faker");
const routineService = require("../services/routine.service");
const logger = require("../../config/logger");
const { nanoid } = require("nanoid");

const createOrUpdateRoutine = async (req, res) => {
  let monthYear = moment().format("MMMM-YYYY");

  const schema = Joi.object({
    id: Joi.number().optional(),
    name: Joi.string().default(monthYear),
    startTime: Joi.string().required(),
    isActive: Joi.bool().default(false),
    periodLength: Joi.number().required(),
    type: Joi.string().valid("simple", "priority").default("simple"),
    offDays: Joi.string().required(),
    semesters: Joi.string().required(),
    endTime: Joi.string().required(),
    breakTime: Joi.string().required(),
  });

  let { error, value } = schema.validate(req.body);

  if (!error) {
    let { id, ...rest } = value;

    try {
      if (id) {
        await db("routines").update(value).where({ id: id });

        return res.json({ status: "success", message: "Routine Updated" });
      } else {
        await db("routines").insert(rest);
        return res.json({ status: "success", message: "Routine Created" });
      }
    } catch (er) {
      return res.json({ status: "failed", error: er });
    }
  } else {
    return res.json({ status: "failed", error: error });
  }
};

const getRoutines = async (req, res) => {
  let { page } = req.query;

  if (!page) {
    page = 1;
  }

  const routines = await db("routines")
    .orderBy("createdAt", "desc")
    .whereNull("deletedAt")
    .paginate({ perPage: 10, currentPage: page });

  return res.json(routines);
};

const activateOrDeactivate = async (req, res) => {
  let { routineId } = req.params;

  let activeRoutine = await db("routines").where({ isActive: true }).first();

  let routine = await db("routines").where("id", "=", routineId).first();

  if (!routine.publish) {
    return res.json({ status: "failed", message: "Publish Routine First" });
  }

  //first deactivate the active routine
  if (activeRoutine) {
    await db("routines")
      .update({ isActive: false })
      .where("id", activeRoutine.id);
  }
  //  console.log('routineId', typeof routineId, 'acitve', activeRoutine.id);

  if (!activeRoutine || routine.id !== activeRoutine?.id) {
    await db("routines").update({ isActive: true }).where("id", routineId);
    return res.json({ status: "success", message: "Activated Successfully" });
  }

  return res.json({ status: "success", message: "Deactivate Successfully" });
};

const publish = async (req, res) => {
  let { routineId } = req.params;

  let routine = await db("routines").where("id", "=", routineId).first();

  if (!routine) {
    return res.json({ status: "failed", message: "Routine Not Found" });
  }

  //if routine already published

  if (routine.publish) {
    return res.json({ status: "info", message: "Routine Already Published" });
  }

  //else publish

  //create classroom and add teacher and student as participants

  const classes = await db("routine_classes")
    .distinct()
    .select("courseId", "teacherId", "routineId")
    .where("routineId", "=", routineId);

  //now create classroom

  const trxProvider = db.transactionProvider();
  const trx = await trxProvider();

  try {
    await trx("routines")
      .update({ publish: new Date() })
      .where("id", "=", routineId);

    for (let cls of classes) {
      console.log("cls", cls);
      let id = nanoid(10);
      await trx("classes").insert({ id, ...cls });

      //now add participants

      const course = await trx("courses")
        .where("id", "=", cls.courseId)
        .first();

      //now get all students from current semester

      const students = await trx("users")
        .select("users.id")
        .join("student_details as sd", "sd.userId", "=", "users.id")
        .where("sd.semesterId", "=", course.semesterId);

      console.log("students", students);

      let participants = students.map((st) => ({ userId: st.id, classId: id }));

      console.log("participants", participants, cls);

      participants = [...participants, { userId: cls.teacherId, classId: id }];

      await trx("class_participants").insert(participants);
    }
    trx.commit();
    res.json({ status: "success", message: "Published" });
  } catch (er) {
    trx.rollback();
    return res.status(500).json({ message: er.message });
  }
};

const deleteRoutine = async (req, res) => {
  let { routineId } = req.params;

  let routine = await db("routines").where({ id: routineId }).first();

  if (!routine) {
    return res.status(404).json({ status: "Routine Not Found" });
  }

  try {
    await db("routines").where({ id: routineId }).delete();

    return res.json({
      status: "success",
      message: "Routine Deleted Successful",
    });
  } catch (er) {
    return res.status(500).json({ message: er });
  }
};

const addClassTimeOne = async (req, res) => {
  let { routineId } = req.params;

  let routine = await db("routines").where({ id: routineId }).first();

  if (!routine) {
    return res.json({ status: "failed", error: "Routine Not found" });
  }
};

const addClass = async (req, res) => {
  let { routineId } = req.params;

  const user = req.user;

  let routine = await db("routines").where({ id: routineId }).first();

  if (!routine) {
    return res.json({ status: "failed", error: "Routine Not found" });
  }

  let schema = Joi.object({
    id: Joi.number().optional(),
    courseId: Joi.number().required(),
    teacherId: Joi.number().required(),
    times: Joi.array().items({
      id: Joi.number(),
      day: Joi.string().required(),
      startTime: Joi.string().required(),
      periods: Joi.string().required(),
    }),
  });

  let { error, value } = schema.validate(req.body);

  if (!error) {
    let { courseId, teacherId, times, id } = value;

    //check if course exists

    let course = await db("courses").where({ id: courseId }).first();

    if (!course) {
      return res.json({ status: "failed", error: "Course does not exists" });
    }

    //check if provided course is in routines

    if (!routine.semesters.split(",").includes(course.semesterId.toString())) {
      return res.json({
        status: "failed",
        message: "Semester of this course is not listed in routine",
      });
    }

    //check is teacherId is exists

    let isTeacherExists = await db("users")
      .where({ userType: "teacher", id: teacherId })
      .first();

    if (!isTeacherExists) {
      return res.json({ status: "failed", error: "Teacher is not exists" });
    }

    //check if class already added in this routine

    let classes = await db("routine_classes").where({
      courseId: courseId,
      routineId: routineId,
    });

    //class exists then append class times

    if (!id && classes.length > 0 && classes.length >= course.credit) {
      return res.json({
        status: "failed",
        message: "Number of class times can not be more than course credits!",
      });
    }

    //Time Overlap check

    for (let time of times) {
      const classEndTime = time.startTime + routine.periodLength * time.periods;

      const isRecordExistsQuery = db("routine_classes as rc")
        .join("courses", "courses.id", "=", "rc.courseId")
        .whereBetween("startTime", [time.startTime, classEndTime])
        .where("day", "=", time.day)
        .where("courses.semesterId", "=", course.semesterId);
      //except current item

      if (id) {
        isRecordExistsQuery.whereNot("rc.id", "=", id);
      }

      let isRecordExists = await isRecordExistsQuery.first();

      if (isRecordExists) {
        return res.json({
          status: "failed",
          message:
            "Time overlap! One or more classes are already in this time range",
        });
      }

      //check if day is in off day

      if (routine.offDays.split(",").includes(time.day)) {
        return res.json({
          status: "failed",
          message: "Provided day is a off day",
        });
      }
    }

    //Todo do not add students or teacher as participants until publish

    const trxProvider = db.transactionProvider();

    const trx = await trxProvider();

    try {
      if (id) {
        //update

        let time = times[0];

        //if try to change course id then check number of classes

        //get current class

        let cls = await trx("routine_classes").where("id", "=", id).first();

        if (cls.courseId !== courseId) {
          //course id to be updated
          // now check number of classes
          if (classes.length >= course.credit) {
            return res.json({
              status: "failed",
              message: "Number of classes can not be more than course credits",
            });
          }
        }

        await trx("routine_classes")
          .update({ ...time, routineId, courseId, teacherId })
          .where("id", "=", id);

        trx.commit();

        return res.json({ status: "success", message: "Updated" });
      } else {
        let timesWithClass = times.map((item) => ({
          ...item,
          courseId,
          teacherId,
          routineId,
        }));

        await trx("routine_classes").insert(timesWithClass);

        trx.commit();
        return res.json({ status: "success", message: "Class created" });
      }
    } catch (er) {
      return res.status(500).json({ message: "Server Error :" + er.message });
    }
  } else {
    return res.json({ status: "failed", error: error });
  }
};

const updateClass = async (req, res) => {
  let { classId, routineId } = req.params;

  let routine = await db("routines").where({ id: routineId }).first();

  let class1 = await db("classes").where({ id: classId }).first();

  if (!class1) {
    return res.json({ status: "failed", error: "Class does not exists" });
  }

  let schema = Joi.object({
    courseId: Joi.number().required(),
    teacherId: Joi.number().required(),
    times: Joi.array().items({
      id: Joi.number().required(),
      day: Joi.string().required(),
      startTime: Joi.string().required(),
      periods: Joi.string().required(),
    }),
  });

  let { error, value } = schema.validate(req.body);

  if (!error) {
    let { courseId, teacherId, times } = value;

    //check if course exists

    let course = await db("courses").where({ id: courseId }).first();

    if (!course) {
      return res.json({ status: "failed", error: "Course does not exists" });
    }

    //check is teacherId is exists

    let isTeacherExists = await db("users")
      .where({ userType: "teacher", id: teacherId })
      .first();

    if (!isTeacherExists) {
      return res.json({ status: "failed", error: "Teacher is not exists" });
    }

    /* let [isValid, error] = routineService.isTimeValid(times);

         if (!isValid) {
             return res.json({status: 'failed', error: error})
         }*/

    if (!(await routineService.isTimeOverlap(times, course, routine))) {
      return res.json({
        status: "failed",
        error: "Time Overlap! Please check your class time",
      });
    }

    let dbDays = await db("class_times").where({ classId: classId });

    const trxProvider = db.transactionProvider();

    const trx = await trxProvider();

    try {
      await trx("classes")
        .update({ teacherId, courseId })
        .where({ id: classId });

      if (dbDays.length === times.length) {
        for (let item of times) {
          await trx("class_times")
            .update({
              day: item.day,
              startTime: item.startTime,
              endTime: item.endTime,
            })
            .where("id", "=", item.id)
            .where("classId", "=", classId);
        }
      } else {
        await trx("class_times").where({ classId: classId }).delete();

        let timesWithClass = times.map((item) => ({
          ...item,
          classId: classId,
        }));

        await trx("class_times").insert(timesWithClass);
      }

      trx.commit();

      return res.json({ status: "success", message: "Class Updated" });
    } catch (error) {
      trx.rollback();
      return res.json({ status: "failed", error: error });
    }
  } else {
    return res.json({ status: "failed", error: error });
  }
};

const viewRoutine = async (req, res) => {
  let { routineId } = req.params;

  let routine = await db("routines").where({ id: routineId }).first();

  if (!routine) {
    return res.json({ status: "failed", error: "Routine Not Found" });
  }

  routine.semesters = await db("semesters")
    .select("id", "shortName", "name")
    .orderBy("shortName")
    .whereIn("id", routine.semesters.split(","));

  return res.json(routine);
};

const getRoutineClasses = async (req, res) => {
  let { routineId } = req.params;

  let { semesterId } = req.query;

  let classQuery = db("routine_classes as rc")
    .join("courses", "courses.id", "=", "rc.courseId")
    .join("semesters", "semesters.id", "=", "courses.semesterId")
    .join("users", "users.id", "=", "rc.teacherId")
    .where({ "rc.routineId": routineId });

  if (semesterId) {
    classQuery.where("semesters.id", "=", semesterId);
  }

  let classes = await classQuery.select(
    "courses.name as courseName",
    "rc.id",
    "courses.id as courseId",
    "users.id as teacherId",
    "courses.courseCode",

    "users.firstName as teacherFirstName",
    "users.lastName as teacherLastName",
    "semesters.shortName",
    "semesters.name as semesterName",
    "rc.day as day",
    "rc.startTime",
    "rc.periods",
    "rc.id as classTimeId"
  );

  res.json(classes);
};

const getRoutineClassInfo = async (req, res) => {
  let { routineId, courseId } = req.params;

  let cls = await db("routine_classes as rc")
    .select(
      "rc.id",
      "users.id as teacherId",
      "users.firstName",
      "users.lastName"
    )
    .join("users", "users.id", "=", "rc.teacherId")
    .where("rc.courseId", "=", courseId)
    .where("routineId", routineId)
    .first();

  if (!cls) {
    return res.status(404).json("not found");
  }

  return res.json(cls);
};

const canEdit = async (req, res) => {
  const { classId } = req.params;

  const user = req.user;

  const cls = await db("routine_classes").where("id", "=", classId).first();

  const designationOfThisTeacher = await db("designations")
    .join("stuff_details as sd", "sd.designationId", "=", "designations.id")
    .where("sd.userId", "=", cls.teacherId)
    .first();

  const designationOfRequestedUser = await db("designations")
    .join("stuff_details as sd", "sd.designationId", "=", "designations.id")
    .where("sd.userId", "=", user.id)
    .first();

  //compare rank

  let isBefore = moment(designationOfRequestedUser.joiningDate).isBefore(
    moment(designationOfThisTeacher.joiningDate)
  );

  if (
    designationOfRequestedUser.rank < designationOfThisTeacher.rank ||
    isBefore
  ) {
    return res.json({ status: "success", message: "Edit mode enabled" });
  }

  return res.json({
    status: "failed",
    message: "Sorry! The Teacher has higher rank than you.",
  });
};

module.exports = {
  createOrUpdateRoutine,
  getRoutines,
  deleteRoutine,
  addClass,
  viewRoutine,
  updateClass,
  activateOrDeactivate,
  getRoutineClassInfo,
  getRoutineClasses,
  canEdit,
  publish,
};
