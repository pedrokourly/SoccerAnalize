const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
// Armazenar posições dos jogadores
let players = {};

io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    players[socket.id] = {
        x: 50,
        y: 50,
        color: getRandomColor()
    }

    // Enviar estado atual dos jogadores ao novo cliente
    socket.emit('currentPlayers', players);

    socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

    socket.on('move', (direction) => {
        const player = players[socket.id];
        if (!player) return;

        const speed = 5;
        if (direction === 'left') player.x -= speed;
        else if (direction === 'right') player.x += speed;
        else if (direction === 'up') player.y -= speed;
        else if (direction === 'down') player.y += speed;
        io.emit('playerMoved', { id: socket.id, ...player });
    });

    socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000 ...');
});