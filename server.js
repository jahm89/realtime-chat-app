const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const users = new Map(); // To store user information

app.use(express.static(path.join(__dirname, 'public')));

app.get('/users', (req, res) => {
    res.json(Array.from(users.values()).map(user => ({
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar
    })));
});

wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    let userId;

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        console.log('Received message:', parsedMessage);

        switch (parsedMessage.type) {
            case 'login':
                userId = parsedMessage.id;
                users.set(userId, { ...parsedMessage, ws });
                broadcastUsers();
            break;
            case 'logout':
                users.delete(userId);
                broadcastUsers();
            break;
            case 'message':
                broadcastMessage(parsedMessage);
            break;
            case 'chatRequest':
                const targetUser = users.get(parsedMessage.targetId);
                if (targetUser && targetUser.ws) {
                    targetUser.ws.send(JSON.stringify({
                        type: 'chatRequest',
                        from: parsedMessage.fromId,
                        fromName: parsedMessage.fromName,
                        message: parsedMessage.message
                    }));
                } else {
                    console.log(`Target user ${parsedMessage.targetId} not found or no WebSocket connection`);
                }
            break;
            case 'endChat':
                const targetedUser = users.get(parsedMessage.targetId);
                if (targetedUser && targetedUser.ws) {
                    targetedUser.ws.send(JSON.stringify({
                        type: 'endChat'
                    }));
                } else {
                    console.log(`Target user ${parsedMessage.targetId} not found or no WebSocket connection`);
                }
            break;
            case 'webrtcOffer':
            case 'webrtcAnswer':
            case 'webrtcIceCandidate':
                const target = users.get(parsedMessage.targetId);
                if (target && target.ws) {
                    target.ws.send(JSON.stringify(parsedMessage));
                }
            break;
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        users.delete(userId);
        broadcastUsers();
    });
});

function broadcastUsers() {
    const userList = Array.from(users.values()).map(user => ({
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar
    }));
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'users', users: userList }));
        }
    });
}

function broadcastMessage(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
