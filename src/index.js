const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { getMessage, getLocation } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

app.get('/index', (req, res) => {
    res.send('Hello folks!')
})

let count = 0;

// server (emit) -> client (receive) --acknowledgement --> server
// client (emit) -> server (receive) --acknowledgement --> client

io.on('connection', (socket) => {
    console.log('New Websocket connection');

    // socket.emit('message', getMessage('Welcome!'));
    // socket.broadcast.emit('message', getMessage('A new user has joined!'));

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id:socket.id, username, room })
        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', getMessage('Admin', 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', getMessage('Admin', `${user.username} has joined!`));

        io.to(user.room).emit('roomData', {
            room: user.room,
            roomUsers: getUsersInRoom(user.room)
        })

        callback();

        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit, socket.broadcast.to.emit
    })

    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter();
        if(filter.isProfane(msg)) return callback('Profanity is not allowed!')

        io.to(user.room).emit('message', getMessage(user.username, msg));
        callback();
    })

    socket.on('Geolocation', (location, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', getLocation(user.username, `https://google.com/maps?q=${location.lat},${location.long}`))
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', getMessage('Admin', `${user.username} has left!`))

            io.to(user.room).emit('roomData', {
                room: user.room,
                roomUsers: getUsersInRoom(user.room)
            })
        }
    })
});

server.listen(port, () => {
    console.log(`Serving listening at ${port}`);
})