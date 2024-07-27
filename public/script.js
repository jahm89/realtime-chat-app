const HOST = location.origin.replace(/^https/, 'wss')
const ws = new WebSocket(HOST);

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
