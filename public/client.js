const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let players = {};

socket.on('currentPlayers', (serverPlayers) => {
    players = serverPlayers;
    render();
});

socket.on('newPlayer', (player) => {
    players[player.id] = player;
    render();
});

socket.on('playerMoved', (player) => {
    players[player.id] = player;
    render();
});

socket.on('playerDisconnected', (playerId) => {
    delete players[playerId];
    render();
});

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let id in players) {
        const player = players[id];
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, 20, 20);
    }
}

document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key === 'ArrowLeft') socket.emit('move', 'left');
    else if (key === 'ArrowRight') socket.emit('move', 'right');
    else if (key === 'ArrowUp') socket.emit('move', 'up');
    else if (key === 'ArrowDown') socket.emit('move', 'down');
});