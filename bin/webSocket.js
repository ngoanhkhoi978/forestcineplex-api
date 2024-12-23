const WebSocket = require('ws');
let wss;
const jwt = require('jsonwebtoken');

let clients = {};
let admins = {};

function createWebSocketServer(server) {
    wss = new WebSocket.Server({
        server,
    });
    let token = null;

    wss.on('connection', (ws, req) => {
        try {
            const token = req.headers.cookie
                .split(';')
                .find((c) => c.trim().startsWith('token='))
                .split('=')[1];
        } catch (e) {}

        console.log('1 browser connect');

        ws.on('message', (message) => {
            const msg = JSON.parse(message);
            console.log(msg);

            switch (msg.type) {
                case 'admin/setRole':
                    if (!token) {
                        return;
                    }
                    const { userId, role } = jwt.verify(token, process.env.JWT_SECRET);
                    console.log(userId, role, 'connected');
                    break;
            }
        });

        ws.on('close', () => {
            delete clients[ws];
            delete admins[ws];
            console.log('User disconnected');
        });
    });

    return wss;
}

function getWebSocketServer() {
    if (!wss) {
        throw new Error('WebSocket server has not been initialized');
    }
    return wss;
}

module.exports = { createWebSocketServer, getWebSocketServer, admins, clients };
