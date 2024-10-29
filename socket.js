const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = {}; // Object to store users with socket IDs

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/socket.html');
});

io.on('connection', (socket) => {
  socket.on('set nickname', (nickname) => {
    // Store the nickname with the socket ID
    users[socket.id] = nickname;
    
    // Notify all users about the new user joining
    io.emit('user connected', nickname);

    // Update the online users list for all clients
    io.emit('update online users', Object.values(users));
  });

  // Handle chat message event
  socket.on('chat message', (msg) => {
    const nickname = users[socket.id];
    io.emit('chat message', { nickname, msg }); // Broadcast to all users
  });

  // Handle typing event
  socket.on('typing', () => {
    const nickname = users[socket.id];
    socket.broadcast.emit('user typing', nickname); // Notify others of typing
  });

  // Handle stop typing event
  socket.on('stop typing', () => {
    socket.broadcast.emit('user stop typing'); // Notify others to remove typing indicator
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    const nickname = users[socket.id];
    delete users[socket.id]; // Remove the user from the list

    // Notify all users about the user disconnecting
    io.emit('user disconnected', nickname);

    // Update the online users list for all clients
    io.emit('update online users', Object.values(users));
  });
});

server.listen(3000, () => {
  console.log('listening on http://localhost:3000/');
});