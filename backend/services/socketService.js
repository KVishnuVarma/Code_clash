const socketIo = require('socket.io');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join a room
        socket.on('join_room', (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room: ${room}`);
        });

        // Leave a room
        socket.on('leave_room', (room) => {
            socket.leave(room);
            console.log(`User ${socket.id} left room: ${room}`);
        });

        // Handle typing status
        socket.on('typing_start', ({ room, username }) => {
            socket.to(room).emit('user_typing', { username, isTyping: true });
        });

        socket.on('typing_end', ({ room, username }) => {
            socket.to(room).emit('user_typing', { username, isTyping: false });
        });

        // Handle message delivery status
        socket.on('message_delivered', async ({ messageId, userId, room }) => {
            const message = await ChatMessage.findById(messageId);
            if (message && !message.status.delivered.includes(userId)) {
                message.status.delivered.push(userId);
                await message.save();
                io.to(room).emit('delivery_status_update', { messageId, status: 'delivered', userId });
            }
        });

        // Handle message read status
        socket.on('message_read', async ({ messageId, userId, room }) => {
            const message = await ChatMessage.findById(messageId);
            if (message && !message.status.read.includes(userId)) {
                message.status.read.push(userId);
                await message.save();
                io.to(room).emit('read_status_update', { messageId, status: 'read', userId });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIO
};
