const app = require('./app/app');

const server = app.listen(5000, () => {
    console.log("running")
});

const io = require('socket.io')(server, {
    cors: {
        origin: ['http://localhost:3000'],
        allowedHeaders: ['GET', 'PUT']
    }
});

io.on('connection', (socket) => {
    console.log('connection');

    socket.on('chat-room', ({conversationId, user}) => {

        socket.join(conversationId);

        console.log('chat-room :', conversationId);

    })

    socket.on('sendMessage', ({message, conversationId}) => {

        console.log('message', message, 'conversationId', conversationId);

        socket.to(conversationId).emit('message', {message});
    })

    socket.on('leave-chat-room', ({conversationId}) => {
        socket.leave(conversationId);

        console.log('leave chat room');
    })

    socket.on("disconnect", () => {

        console.log("User disconnected");

    })

})