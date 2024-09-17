const express = require('express');
const http = require('http');
const socket_io = require('socket.io');

const app = express();
const server = http.createServer(app);
const socketIo = socketIo(server);

socketIo.on('connection', (socket) => {
  console.log('User connected!');

  socket.on('signal', (data) => {
    socket.broadcast.emit('signal', data);
  });
});

server.listen(3000, () => console.log('Server listening on port 3000'));