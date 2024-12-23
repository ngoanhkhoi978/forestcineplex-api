const WebSocket = require('ws');

const initWebSocket = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('Client connected');
        ws.on('close', () => {
            console.log('Client disconnected');
        });

        ws.send('Welcome to the WebSocket server!');
    });

    return wss;
};

module.exports = initWebSocket;
