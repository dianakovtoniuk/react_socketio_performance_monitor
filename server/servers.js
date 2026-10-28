// Socket.IO server that serves both the node and the react clients
// Req:
// - socket.io

const http = require('http');
const { Server } = require('socket.io');
const socketMain = require('./socketMain');

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3001',
        credentials: true,
    },
});

// socketMain is OUR file where our emits and listens happen. It needs the io object
socketMain(io, process.pid);

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
