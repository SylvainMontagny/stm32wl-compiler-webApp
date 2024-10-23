const socketIo = require('socket.io');

module.exports = (server) => {
    // Autoriser toutes les origines
    const io = socketIo(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"] 
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected');

        // Envoyer une réponse au client
        socket.on('message', (data) => {
            console.log('Message from client:', data);
            
            socket.emit('response', { message: 'Message reçu!' });
        });

        // Détecter la déconnexion du client
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};
