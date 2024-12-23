const socketIO = require('socket.io');
const cookieParser = require('cookie');
const jwt = require('jsonwebtoken');
const env = require('./environment');

let io;

let clients = [];
let users = {};
let admins = {};

const initSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:4000'],
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log('Client connected', socket.handshake.headers.origin);

        clients.push({ id: socket.id });

        socket.on('chatMessage', (message) => {
            console.log('Tin nhắn từ client:', message);
        });

        socket.on('setRole', () => {
            const cookies = cookieParser.parse(socket.request.headers.cookie || '');
            const token = cookies.token;

            jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
                if (!err) {
                    if (socket.handshake.headers.origin === 'http://localhost:5173') {
                        users[socket.id] = { userId: decoded.userId };
                    }

                    if (decoded.role === 'admin' && socket.handshake.headers.origin === 'http://localhost:4000') {
                        admins[socket.id] = { userId: decoded.userId };
                        console.log(admins);
                    }
                }
            });
        });

        socket.on('disconnect', () => {
            console.log('Co thang out');
            delete users[socket.id];
            delete admins[socket.id];
        });
    });
};

const notifyAdmins = (type, message) => {
    Object.keys(admins).forEach((socketId) => {
        io.to(socketId).emit(type, message);
    });
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO chưa được khởi tạo!');
    }
    return io;
};

module.exports = { initSocket, getIO, users, admins, notifyAdmins };
