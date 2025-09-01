const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Configurações do campo de futebol
const FIELD_CONFIG = {
    width: 800,
    height: 520,
    centerX: 400,
    centerY: 260
};

// Timer do jogo
let gameStartTime = Date.now();

// Posições iniciais dos jogadores
const PLAYER_POSITIONS = [
    // Time Casa (azul)
    { x: 80, y: 260, team: 'home', name: 'Silva', position: 'Goleiro', number: 1 },
    { x: 180, y: 180, team: 'home', name: 'Santos', position: 'Zagueiro', number: 2 },
    { x: 180, y: 340, team: 'home', name: 'Costa', position: 'Zagueiro', number: 3 },
    { x: 280, y: 130, team: 'home', name: 'Lima', position: 'Meio-campo', number: 4 },
    { x: 280, y: 260, team: 'home', name: 'Ferreira', position: 'Meio-campo', number: 5 },
    { x: 280, y: 390, team: 'home', name: 'Rodrigues', position: 'Meio-campo', number: 6 },
    { x: 380, y: 200, team: 'home', name: 'Barbosa', position: 'Atacante', number: 7 },
    { x: 380, y: 320, team: 'home', name: 'Martins', position: 'Atacante', number: 8 },
    
    // Time Visitante (vermelho)
    { x: 720, y: 260, team: 'away', name: 'Johnson', position: 'Goleiro', number: 1 },
    { x: 620, y: 180, team: 'away', name: 'Williams', position: 'Zagueiro', number: 2 },
    { x: 620, y: 340, team: 'away', name: 'Brown', position: 'Zagueiro', number: 3 },
    { x: 520, y: 130, team: 'away', name: 'Miller', position: 'Meio-campo', number: 4 },
    { x: 520, y: 260, team: 'away', name: 'Davis', position: 'Meio-campo', number: 5 },
    { x: 520, y: 390, team: 'away', name: 'Wilson', position: 'Meio-campo', number: 6 },
    { x: 420, y: 200, team: 'away', name: 'Taylor', position: 'Atacante', number: 7 },
    { x: 420, y: 320, team: 'away', name: 'Anderson', position: 'Atacante', number: 8 }
];

// Dados dos jogadores
let players = {};
let globalHeatmapData = {}; // Heatmap global de todo o jogo

function initializePlayers() {
    PLAYER_POSITIONS.forEach((playerData, index) => {
        const playerId = `${playerData.team}_${index}`;
        players[playerId] = {
            ...playerData,
            color: playerData.team === 'home' ? '#4285F4' : '#EA4335',
            targetX: playerData.x,
            targetY: playerData.y,
            stats: generatePlayerStats()
        };
    });
}

function generatePlayerStats() {
    return {
        heartRate: Math.floor(Math.random() * (180 - 120) + 120), // 120-180 bpm
        speed: Math.random() * 25 + 5, // 5-30 km/h
        stamina: Math.floor(Math.random() * 100), // 0-100%
        distanceCovered: Math.random() * 3000, // metros percorridos
        temperature: Math.random() * 5 + 36 // 36-41°C
    };
}

function updateGlobalHeatmap(x, y) {
    // Criar grid de heatmap (dividir campo em células de 20x20)
    const cellSize = 20;
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    const key = `${gridX}_${gridY}`;
    
    if (!globalHeatmapData[key]) {
        globalHeatmapData[key] = {
            x: gridX * cellSize + cellSize / 2,
            y: gridY * cellSize + cellSize / 2,
            intensity: 0
        };
    }
    
    globalHeatmapData[key].intensity += 1;
}

function simulatePlayerMovement() {
    Object.keys(players).forEach(playerId => {
        const player = players[playerId];
        
        // Movimento aleatório baseado na posição
        const moveChance = Math.random();
        
        if (moveChance < 0.3) { // 30% chance de se mover
            let moveRange = 50; // Distância básica de movimento
            
            // Ajustar movimento baseado na posição
            if (player.position === 'Goleiro') {
                moveRange = 25;
            } else if (player.position.includes('Atacante')) {
                moveRange = 70;
            }
            
            // Calcular nova posição alvo
            const newTargetX = player.targetX + (Math.random() - 0.5) * moveRange;
            const newTargetY = player.targetY + (Math.random() - 0.5) * moveRange;
            
            // Manter dentro dos limites do campo
            player.targetX = Math.max(20, Math.min(FIELD_CONFIG.width - 20, newTargetX));
            player.targetY = Math.max(20, Math.min(FIELD_CONFIG.height - 20, newTargetY));
        }
        
        // Movimento suave em direção ao alvo
        const speed = 1;
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;
        
        if (Math.abs(dx) > 1) {
            player.x += dx > 0 ? speed : -speed;
        }
        if (Math.abs(dy) > 1) {
            player.y += dy > 0 ? speed : -speed;
        }
        
        // Atualizar heatmap global
        updateGlobalHeatmap(player.x, player.y);
        
        // Atualizar estatísticas ocasionalmente
        if (Math.random() < 0.05) { // 5% chance
            player.stats = generatePlayerStats();
        }
    });
}

// Inicializar jogadores
initializePlayers();

// Simular movimento dos jogadores a cada 200ms
setInterval(() => {
    simulatePlayerMovement();
    io.emit('gameUpdate', { players: players });
}, 200);

// Enviar dados do heatmap global a cada 3 segundos
setInterval(() => {
    io.emit('heatmapUpdate', globalHeatmapData);
}, 3000);

io.on('connection', (socket) => {
    console.log(`Coach conectado: ${socket.id}`);

    // Enviar configurações do campo
    socket.emit('fieldConfig', FIELD_CONFIG);
    
    // Enviar estado atual do jogo
    socket.emit('gameUpdate', { players: players });
    
    // Enviar dados do heatmap global atual
    socket.emit('heatmapUpdate', globalHeatmapData);

    socket.on('disconnect', () => {
        console.log(`Coach desconectado: ${socket.id}`);
    });
});

server.listen(3000, () => {
    console.log('🏟️  Servidor SoccerAnalyze rodando em http://localhost:3000');
    console.log('📊 Monitoramento de jogadores ativo!');
});