const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Static files serve karein (HTML, CSS, JS)
app.use(express.static('public'));

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('message', (data) => {
        io.emit('message', data); // Sabhi users ko message bhejo
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Server start karein
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});