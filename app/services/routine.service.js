const moment = require("../../config/moment");
const db = require("../../config/database");

const isTimeValid = (days) => {

    //check if time is valid
    //check class length
    //check if class two times in a day
    let prevDay;
    let isValid = true;
    let error = '';

    for (let day of days) {

        let diff = moment(day.endTime, 'HH:mm:ss').diff(moment(day.startTime, 'HH:mm:ss'), 'minutes');

        if (!(diff > 30 && diff <= 180)) {
            error = 'Class Length must be 30 to 180 minutes';
            isValid = false;
            break;
        }

        if (prevDay && prevDay.day === day) {
            error = 'Multiple Class in A day is not allowed. Please check your time and day';
            isValid = false;
            break;

        }
        prevDay = day;


    }

    return [isValid, error];

}

const isTimeOverlap = async (times, course, routine, classId) => {

    //Time Overlap check

    let isOverlap = false;

    for (let time of times) {

        let classesInTheDay = await db('classes')
            .select('classes.id', 'ct.day as day', 'ct.startTime',
                'ct.periods')
            .join('class_times as ct', 'ct.classId', '=', 'classes.id')
            .join('courses', 'courses.id', '=', 'classes.courseId')
            .where({
                'ct.day': time.day, 'classes.routineId': routine.id,
                'courses.semesterId': course.semesterId
            });

        for (let cls of classesInTheDay) {

            let dbTimeRange = moment.rangeFromInterval('minutes', cls.periods * routine.periodLength, moment(cls.startTime, 'HH:mm:ss'));

            let inputTimeRange = moment.rangeFromInterval('minutes', time.periods * routine.periodLength, moment(time.startTime, 'HH:mm'));

            if (dbTimeRange.overlaps(inputTimeRange)) {
                isOverlap = true;
                break;
            }

        }

    }

    return isOverlap;
}

module.exports = {
    isTimeValid,
    isTimeOverlap
}