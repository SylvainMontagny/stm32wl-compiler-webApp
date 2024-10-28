const socketIo = require('socket.io');


module.exports = (server) => {
    // Autoriser toutes les origines
    const clientList = []
    
    const io = socketIo(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"] 
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');
        // Envoyer une réponse au client
        socket.on('create_id', (userID) => {  
            console.log('test');
            clientList.push({ "userID" : userID, "socketId": socket.id });
            console.log(clientList);
            socket.emit('response', { socketId: socket.id });
        });

        // Détecter la déconnexion du client
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};
