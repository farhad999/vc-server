const app = require('./app/app');

const server = app.listen(5000, () => {
    console.log("running")
});