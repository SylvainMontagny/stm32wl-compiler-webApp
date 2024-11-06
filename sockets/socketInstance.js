const socketIo = require('socket.io');
const clientList = require('./clientList');
let io;

// Initializes the Socket.IO server with CORS settings and handles client connections.
const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');
        socket.on('create_id', (userID) => {  
            clientList.push({ "userID" : userID, "socketId": socket.id });
        });
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
    const client = clientList.find(client => client.userID === clientId);
    if (client) {
        io.to(client.socketId).emit('compilation_log', { message: logMessage });
    } else {
        console.warn(`Client with ID ${clientId} not found in clientList.`);
    }
}

module.exports = {
    initSocket,
    getSocketInstance,
    sendLogToClient
};

