const ws = new WebSocket('ws://localhost:3000');

// Check WebSocket connection status
ws.onopen = () => {
    console.log('WebSocket connection established');
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};

// Utility functions
function redirectTo(url) {
    window.location.href = url;
}

function displayMessage(sender, message) {
    const chatArea = document.getElementById('chatArea');
    const messageElement = document.createElement('div');
    messageElement.textContent = `${sender}: ${message}`;
    chatArea.appendChild(messageElement);
}

// Home Page
if (window.location.pathname === '/home.html') {
    
}

// Chat Page
if (window.location.pathname === '/chat.html') {
    const chatWithId = sessionStorage.getItem('chatWithId');
    const chatWithName = sessionStorage.getItem('chatWithName');
    const chatWith = document.getElementById('chatWith');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const endChatButton = document.getElementById('endChatButton');

    chatWith.textContent = `Chat with ${chatWithName}`;

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const userId = JSON.parse(sessionStorage.getItem('user')).id;
        if (data.type === 'message' && data.to === userId) {
            displayMessage(data.fromName, data.message);
        }
    };

    sendButton.addEventListener('click', () => {
        const message = chatInput.value;
        if (message) {
            ws.send(JSON.stringify({
                type: 'message',
                from:  JSON.parse(sessionStorage.getItem('user')).id,
                fromName: JSON.parse(sessionStorage.getItem('user')).nickname,
                to: chatWithId,
                message
            }));
            displayMessage('You', message);
            chatInput.value = '';
        } else {
            console.error('Message input is empty');
        }
    });

    endChatButton.addEventListener('click', () => {
        sessionStorage.removeItem('chatWithId');
        redirectTo('/home.html');
    });
}
