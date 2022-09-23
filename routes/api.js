const express = require("express");
const router = express.Router();
const defaultRoute = require("./default.route");
const userRoute = require("./user.route");
const fakerRoute = require("./faker.route");
const courseRoute = require("./course.route");
const routineRoute = require("./routine.route");
const classroomRoute = require("./classroom.route");
const semesterRoute = require("./semester.route");
const fileRoute = require("./file.route");
const groupRoute = require("./group.route");
const messageRoute = require("./message.route");
const questionRoute = require('./question.route');
const dashboardRoute = require('./dashboard.route')

const routes = [
  {
    path: "/routines",
    route: routineRoute,
  },
  {
    path: "/semesters",
    route: semesterRoute,
  },
  {
    path: "/c",
    route: classroomRoute,
  },
  {
    path: "/courses",
    route: courseRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/faker",
    route: fakerRoute,
  },
  {
    path: "/f",
    route: fileRoute,
  },
  {
    path: "/g",
    route: groupRoute,
  },
  {
    path: "/m",
    route: messageRoute,
  },
  {
    path: "/q",
    route: questionRoute,
  },
  {
    path: '/home',
    route: dashboardRoute,
  },
  {
    path: "/",
    route: defaultRoute,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
