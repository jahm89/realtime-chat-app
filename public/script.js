const HOST = location.origin.replace(/^https/, 'ws')
const ws = new WebSocket(HOST);

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

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const userId = JSON.parse(sessionStorage.getItem('user')).id;
    if (data.type === 'message' && data.to === userId) {
        displayMessage(data.fromName, data.message);
    } else if (data.type === 'endChat') {
        sessionStorage.removeItem('chatWithId');
        sessionStorage.removeItem('chatWithName');
        redirectTo('/home.html');
    } else if (data.type === 'webrtcOffer') {
        handleWebRTCOffer(data);
    } else if (data.type === 'webrtcAnswer') {
        handleWebRTCAnswer(data);
    } else if (data.type === 'webrtcIceCandidate') {
        handleWebRTCIceCandidate(data);
    }
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
