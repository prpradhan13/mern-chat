import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoute from './routes/authRoute.js'
import chatRoute from './routes/chatRoute.js'
import messageRoute from './routes/messageRoute.js'
import { Server } from 'socket.io';
import path from 'path';

// config env
dotenv.config()

// connect to database
connectDB();

// Rest Object 
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// routes
app.use('/api/auth', authRoute);
app.use('/api/chat', chatRoute);
app.use('/api/message', messageRoute);

app.use('*', function(req, res){
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'))
})

const PORT = process.env.PORT || 8080

// Run Listen
const listenServer = app.listen(PORT, (req, res) => {
})

const io = new Server(listenServer, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:3000',
    },
})

io.on("connection", (socket) => {
    socket.on('setup', (userData) =>{
        socket.join(userData._id);
        socket.emit("connection");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

        if(!chat.users) return 

        chat.users.forEach(user => {
            if(user._id === newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved);
        })
    });

    socket.off("setup", (userData) => {
        socket.leave(userData._id);
    })

    // Error handling
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
})

