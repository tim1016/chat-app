const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages');

const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users');

// console.log(publicDirectoryPath)

const app = express();
const server = http.createServer(app);
const io = socketio(server);
// const users = [];


const PORT = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicDirectoryPath)); 

io.on('connection',(socket)=>{

    socket.on('join', ({username, room}, callback)=>{

        const {error, user} = addUser({
            id: socket.id,
            username,
            room
        });

        // console.log(user, error)
        if(error){
            return callback(error);
        }
        // console.log(user)
        socket.join(user.room);
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })


        socket.emit('message', generateMessage('Admin', `Welcome! ${user.username}`));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined ${user.room}`));
        callback();
    });

    socket.on('sendMessage', (message, callback)=>{

        const user = getUser(socket.id);

        const filter = new Filter();

        if(filter.isProfane(message)){
            return callback('Please do not use bad language');
        } else{
            io.to(user.room).emit('message', generateMessage(user.username, message));
            callback();
        }

    });

    socket.on('location', (location, callback) =>{

        const user = getUser(socket.id);
        io.to(user.room).emit('location', generateLocationMessage(user.username, location));
        callback(`Acknowledged by server`);
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`)); 
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })   
        }      
    });
});

server.listen(PORT);  
 

