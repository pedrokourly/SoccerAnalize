const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const heatmapCanvas = document.getElementById('heatmapCanvas');
const heatmapCtx = heatmapCanvas.getContext('2d');

let players = {};
let heatmapData = {};
let fieldConfig = {};
let showStats = true;
let gameStartTime = Date.now();

// Charts
let performanceChart = null;
let heartRateChart = null;

// Timer do jogo
function updateGameTimer() {
    const elapsed = Date.now() - gameStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const timerElement = document.getElementById('gameTimer');
    if (timerElement) {
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Atualizar timer a cada segundo
setInterval(updateGameTimer, 1000);

// Inicializar gráficos
function initCharts() {
    // Performance Chart
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    performanceChart = new Chart(performanceCtx, {
        type: 'radar',
        data: {
            labels: ['Velocidade Média', 'Stamina Média', 'Distância', 'Atividade', 'Performance'],
            datasets: [{
                label: 'Time Casa',
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(66, 133, 244, 0.2)',
                borderColor: 'rgba(66, 133, 244, 1)',
                borderWidth: 2
            }, {
                label: 'Time Visitante', 
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(234, 67, 53, 0.2)',
                borderColor: 'rgba(234, 67, 53, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    },
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    },
                    pointLabels: {
                        color: 'white'
                    }
                }
            }
        }
    });

    // Heart Rate Chart
    const heartRateCtx = document.getElementById('heartRateChart').getContext('2d');
    heartRateChart = new Chart(heartRateCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'BPM Médio Casa',
                data: [],
                borderColor: 'rgba(66, 133, 244, 1)',
                backgroundColor: 'rgba(66, 133, 244, 0.1)',
                tension: 0.4
            }, {
                label: 'BPM Médio Visitante',
                data: [],
                borderColor: 'rgba(234, 67, 53, 1)',
                backgroundColor: 'rgba(234, 67, 53, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 60,
                    max: 200,
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Atualizar gráficos
function updateCharts() {
    if (!performanceChart || !heartRateChart || !players) return;

    const homePlayers = Object.values(players).filter(p => p.team === 'home');
    const awayPlayers = Object.values(players).filter(p => p.team === 'away');

    // Calcular médias
    function calculateTeamAverages(teamPlayers) {
        if (teamPlayers.length === 0) return { speed: 0, stamina: 0, distance: 0, heartRate: 0 };
        
        const totals = teamPlayers.reduce((acc, player) => {
            if (player.stats) {
                acc.speed += player.stats.speed;
                acc.stamina += player.stats.stamina;
                acc.distance += player.stats.distanceCovered;
                acc.heartRate += player.stats.heartRate;
            }
            return acc;
        }, { speed: 0, stamina: 0, distance: 0, heartRate: 0 });

        return {
            speed: totals.speed / teamPlayers.length,
            stamina: totals.stamina / teamPlayers.length,
            distance: totals.distance / teamPlayers.length,
            heartRate: totals.heartRate / teamPlayers.length
        };
    }

    const homeAvg = calculateTeamAverages(homePlayers);
    const awayAvg = calculateTeamAverages(awayPlayers);

    // Atualizar radar chart
    performanceChart.data.datasets[0].data = [
        Math.min(homeAvg.speed * 3, 100), // Velocidade (normalizada)
        homeAvg.stamina,
        Math.min(homeAvg.distance / 50, 100), // Distância (normalizada)
        Math.min((homeAvg.heartRate - 60) * 2, 100), // Atividade baseada no BPM
        Math.min((homeAvg.speed + homeAvg.stamina) / 2, 100) // Performance geral
    ];

    performanceChart.data.datasets[1].data = [
        Math.min(awayAvg.speed * 3, 100),
        awayAvg.stamina,
        Math.min(awayAvg.distance / 50, 100),
        Math.min((awayAvg.heartRate - 60) * 2, 100),
        Math.min((awayAvg.speed + awayAvg.stamina) / 2, 100)
    ];

    performanceChart.update('none');

    // Atualizar line chart de batimentos
    const currentTime = new Date().toLocaleTimeString();
    
    if (heartRateChart.data.labels.length > 20) {
        heartRateChart.data.labels.shift();
        heartRateChart.data.datasets[0].data.shift();
        heartRateChart.data.datasets[1].data.shift();
    }

    heartRateChart.data.labels.push(currentTime);
    heartRateChart.data.datasets[0].data.push(homeAvg.heartRate);
    heartRateChart.data.datasets[1].data.push(awayAvg.heartRate);

    heartRateChart.update('none');
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initCharts, 100);
});

// Receber configurações do campo
socket.on('fieldConfig', (config) => {
    fieldConfig = config;
    canvas.width = config.width;
    canvas.height = config.height;
    heatmapCanvas.width = config.width;
    heatmapCanvas.height = config.height;
    render();
    renderHeatmap();
});

socket.on('gameUpdate', (data) => {
    players = data.players;
    render();
    updateStatsDisplay();
    updateCharts();
});

socket.on('heatmapUpdate', (heatmap) => {
    heatmapData = heatmap;
    renderHeatmap();
});

function drawField() {
    // Fundo do campo
    ctx.fillStyle = '#0F5132';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Padrão de grama
    ctx.fillStyle = '#198754';
    for (let y = 0; y < canvas.height; y += 20) {
        ctx.fillRect(0, y, canvas.width, 10);
    }
    
    drawFieldLines(ctx);
}

function drawFieldLines(context) {
    // Linhas do campo
    context.strokeStyle = 'white';
    context.lineWidth = 3;
    
    // Bordas do campo
    context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Linha central
    context.beginPath();
    context.moveTo(canvas.width / 2, 10);
    context.lineTo(canvas.width / 2, canvas.height - 10);
    context.stroke();
    
    // Círculo central
    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 2, 50, 0, 2 * Math.PI);
    context.stroke();
    
    // Ponto central
    context.fillStyle = 'white';
    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 2, 3, 0, 2 * Math.PI);
    context.fill();
    
    // Área do gol esquerda
    context.strokeRect(10, canvas.height / 2 - 100, 120, 200);
    context.strokeRect(10, canvas.height / 2 - 50, 50, 100);
    
    // Área do gol direita
    context.strokeRect(canvas.width - 130, canvas.height / 2 - 100, 120, 200);
    context.strokeRect(canvas.width - 60, canvas.height / 2 - 50, 50, 100);
    
    // Gols
    context.strokeRect(0, canvas.height / 2 - 30, 10, 60);
    context.strokeRect(canvas.width - 10, canvas.height / 2 - 30, 10, 60);
}

function renderHeatmap() {
    // Limpar canvas do heatmap
    heatmapCtx.clearRect(0, 0, heatmapCanvas.width, heatmapCanvas.height);
    
    // Fundo do campo do heatmap
    heatmapCtx.fillStyle = '#2d5a3d';
    heatmapCtx.fillRect(0, 0, heatmapCanvas.width, heatmapCanvas.height);
    
    if (!heatmapData || Object.keys(heatmapData).length === 0) return;
    
    // Encontrar intensidade máxima para normalizar
    let maxIntensity = 0;
    Object.values(heatmapData).forEach(cell => {
        if (cell.intensity > maxIntensity) {
            maxIntensity = cell.intensity;
        }
    });
    
    // Desenhar células do heatmap
    Object.values(heatmapData).forEach(cell => {
        const normalizedIntensity = cell.intensity / maxIntensity;
        
        // Cores do heatmap: verde (baixa) -> amarelo -> vermelho (alta)
        let red, green, blue;
        
        if (normalizedIntensity < 0.5) {
            // Verde para amarelo
            red = Math.floor(normalizedIntensity * 2 * 255);
            green = 255;
            blue = 0;
        } else {
            // Amarelo para vermelho
            red = 255;
            green = Math.floor((1 - normalizedIntensity) * 2 * 255);
            blue = 0;
        }
        
        const alpha = Math.max(0.3, normalizedIntensity);
        heatmapCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
        
        // Desenhar célula com efeito suave
        const gradient = heatmapCtx.createRadialGradient(
            cell.x, cell.y, 0,
            cell.x, cell.y, 25
        );
        gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
        
        heatmapCtx.fillStyle = gradient;
        heatmapCtx.beginPath();
        heatmapCtx.arc(cell.x, cell.y, 25, 0, 2 * Math.PI);
        heatmapCtx.fill();
    });
    
    // Desenhar linhas do campo por cima
    drawFieldLines(heatmapCtx);
}

function drawHeatmap() {
    // Função removida - agora o heatmap é separado
}

function drawPlayers() {
    Object.keys(players).forEach(id => {
        const player = players[id];
        
        // Sombra do jogador
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(player.x + 2, player.y + 12, 8, 4, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Corpo do jogador
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        // Borda do jogador
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Número do jogador
        ctx.fillStyle = 'white';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.number, player.x, player.y + 3);
        
        // Nome e posição do jogador
        if (showStats) {
            ctx.fillStyle = 'white';
            ctx.font = '9px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(player.name, player.x, player.y - 15);
            
            ctx.font = '7px Arial';
            ctx.fillStyle = '#ccc';
            ctx.fillText(player.position, player.x, player.y - 25);
        }
        
        // Indicadores de performance
        if (player.stats) {
            // Batimento cardíaco elevado
            if (player.stats.heartRate > 160) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(player.x, player.y, 15, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
    });
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawField();
    drawPlayers();
}

function updateStatsDisplay() {
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer || !players) return;
    
    let html = '<h3 class="text-2xl font-bold text-primary mb-6 text-center">📊 Estatísticas dos Jogadores</h3>';
    
    // Separar por times
    const homePlayers = Object.values(players).filter(p => p.team === 'home');
    const awayPlayers = Object.values(players).filter(p => p.team === 'away');
    
    function getPerformanceColor(value, type) {
        switch(type) {
            case 'heartRate':
                if (value > 180) return 'text-red-400';
                if (value > 160) return 'text-orange-400';
                return 'text-green-400';
            case 'speed':
                if (value > 25) return 'text-green-400';
                if (value > 15) return 'text-orange-400';
                return 'text-red-400';
            case 'stamina':
                if (value > 70) return 'text-green-400';
                if (value > 40) return 'text-orange-400';
                return 'text-red-400';
            default:
                return 'text-secondary';
        }
    }
    
    function renderTeam(teamPlayers, teamName, teamColorClass) {
        html += `<div class="mb-8">
            <h4 class="text-xl font-bold ${teamColorClass} mb-4 text-center glass rounded-xl p-3">${teamName}</h4>`;
        
        teamPlayers.forEach(player => {
            if (player.stats) {
                const heartRateColor = getPerformanceColor(player.stats.heartRate, 'heartRate');
                const speedColor = getPerformanceColor(player.stats.speed, 'speed');
                const staminaColor = getPerformanceColor(player.stats.stamina, 'stamina');
                
                html += `
                    <div class="glass rounded-xl p-5 mb-4 hover:bg-white/20 transition-all duration-300 stat-card">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 bg-gradient-to-br from-primary to-green-400 rounded-full flex items-center justify-center text-black font-bold text-sm border-2 border-white/30">
                                ${player.number}
                            </div>
                            <div class="flex-1">
                                <div class="font-bold text-lg text-secondary">${player.name}</div>
                                <div class="text-sm opacity-80 bg-primary/20 px-3 py-1 rounded-full inline-block border border-primary/40">
                                    ${player.position}
                                </div>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
                            <div class="glass rounded-lg p-3 text-center hover:scale-105 transition-transform">
                                <div class="text-lg mb-1">❤️</div>
                                <div class="text-xl font-bold ${heartRateColor}">${player.stats.heartRate}</div>
                                <div class="text-xs opacity-70 uppercase tracking-wide">BPM</div>
                            </div>
                            <div class="glass rounded-lg p-3 text-center hover:scale-105 transition-transform">
                                <div class="text-lg mb-1">🏃</div>
                                <div class="text-xl font-bold ${speedColor}">${player.stats.speed.toFixed(1)}</div>
                                <div class="text-xs opacity-70 uppercase tracking-wide">KM/H</div>
                            </div>
                            <div class="glass rounded-lg p-3 text-center hover:scale-105 transition-transform">
                                <div class="text-lg mb-1">💪</div>
                                <div class="text-xl font-bold ${staminaColor}">${player.stats.stamina}</div>
                                <div class="text-xs opacity-70 uppercase tracking-wide">STAMINA</div>
                            </div>
                            <div class="glass rounded-lg p-3 text-center hover:scale-105 transition-transform">
                                <div class="text-lg mb-1">📏</div>
                                <div class="text-xl font-bold text-secondary">${(player.stats.distanceCovered/1000).toFixed(2)}</div>
                                <div class="text-xs opacity-70 uppercase tracking-wide">KM</div>
                            </div>
                            <div class="glass rounded-lg p-3 text-center hover:scale-105 transition-transform">
                                <div class="text-lg mb-1">🌡️</div>
                                <div class="text-xl font-bold text-secondary">${player.stats.temperature.toFixed(1)}</div>
                                <div class="text-xs opacity-70 uppercase tracking-wide">°C</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
    }
    
    renderTeam(homePlayers, '🏠 Time Casa', 'text-blue-400');
    renderTeam(awayPlayers, '✈️ Time Visitante', 'text-red-400');
    
    statsContainer.innerHTML = html;
}

// Controles do coach
document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === 's') {
        showStats = !showStats;
        render();
    }
});

// Renderizar continuamente
setInterval(render, 50);