const socketIo = require('socket.io');
let io;

// Initializes the Socket.IO server with CORS settings and handles client connections.
const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', () => {
        console.log('New client connected');
    });
};

// Returns the Socket.IO instance, throwing an error if it hasn't been initialized yet.
const getSocketInstance = () => {
    if (!io) {
        throw new Error('Socket not initialized. Call initSocket(server) first.');
    }
    return io;
};

// Sends a compilation log message to the specific client identified by clientId.
function sendLogToClient(clientId, logMessage) {
    io.to(clientId).emit('compilation_log', { message: logMessage });
}

module.exports = {
    initSocket,
    getSocketInstance,
    sendLogToClient
};

