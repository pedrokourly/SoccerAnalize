# ⚽ SoccerAnalyze

**SoccerAnalyze** é uma aplicação web em tempo real para monitoramento e análise de jogadores de futebol durante partidas. O sistema oferece visualização ao vivo das posições dos jogadores, estatísticas detalhadas, mapas de calor e gráficos de performance.

## 🎯 Funcionalidades

### 🏟️ **Monitoramento em Tempo Real**
- Visualização ao vivo das posições dos jogadores no campo
- Movimento simulado baseado nas posições táticas
- Timer de jogo em tempo real
- Interface responsiva e moderna

### 📊 **Análise de Performance**
- **Estatísticas dos Jogadores:**
  - Batimentos cardíacos (BPM)
  - Velocidade atual (km/h)
  - Nível de stamina (%)
  - Distância percorrida (km)
  - Temperatura corporal (°C)

### 🔥 **Mapas de Calor**
- Heatmap global mostrando as áreas mais visitadas do campo
- Análise de densidade de movimento
- Atualização contínua durante o jogo

### 📈 **Gráficos Interativos**
- Gráfico radar de performance geral dos times
- Monitoramento de batimentos cardíacos
- Comparação entre time da casa e visitante

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/pedrokourly/SoccerAnalize.git
   cd SoccerAnalize
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Execute o servidor:**
   ```bash
   npm start
   ```
   ou
   ```bash
   node server.js
   ```

4. **Acesse a aplicação:**
   Abra seu navegador e vá para `http://localhost:3000`

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Socket.IO** - Comunicação em tempo real

### Frontend
- **HTML5 Canvas** - Renderização do campo e visualizações
- **Tailwind CSS** - Estilização responsiva
- **Chart.js** - Gráficos interativos
- **Socket.IO Client** - Comunicação em tempo real

## 📋 Estrutura do Projeto

```
SoccerAnalize/
├── server.js              # Servidor principal com lógica do jogo
├── package.json           # Dependências e scripts
├── public/
│   ├── index.html        # Interface principal
│   ├── client.js         # Lógica do cliente
│   └── index_backup.html # Backup da interface
└── README.md             # Este arquivo
```

## 🎮 Como Usar

### Controles
- **Tecla S**: Mostrar/Ocultar estatísticas dos jogadores
- **Interface Responsiva**: Funciona em desktop, tablet e mobile

### Interpretação dos Dados
- **Círculos Azuis**: Jogadores do time da casa
- **Círculos Vermelhos**: Jogadores do time visitante
- **Números**: Número da camisa do jogador
- **Cores do Heatmap**: Verde (baixa) → Amarelo (média) → Vermelho (alta densidade)

### Alertas
- **Indicador Vermelho**: Batimentos cardíacos elevados (>170 BPM)
- **Animações Suaves**: Movimento natural dos jogadores

## 📊 Dados Simulados

O sistema simula dados realistas baseados em:
- **Posições Táticas**: Goleiro, Zagueiro, Meio-campo, Atacante
- **Movimento Inteligente**: Baseado na posição do jogador
- **Estatísticas Dinâmicas**: Valores que mudam ao longo do tempo
- **Formação 1-2-3-2**: Time da casa e visitante

### Times Simulados

**Time da Casa (Azul):**
- Silva (Goleiro) #1
- Santos (Zagueiro) #2, Costa (Zagueiro) #3
- Lima (Meio-campo) #4, Ferreira (Meio-campo) #5, Rodrigues (Meio-campo) #6
- Barbosa (Atacante) #7, Martins (Atacante) #8

**Time Visitante (Vermelho):**
- Johnson (Goleiro) #1
- Williams (Zagueiro) #2, Brown (Zagueiro) #3
- Miller (Meio-campo) #4, Davis (Meio-campo) #5, Wilson (Meio-campo) #6
- Taylor (Atacante) #7, Anderson (Atacante) #8

## 🔧 Configurações

### Campo de Futebol
- **Dimensões**: 800x520 pixels
- **Centro do campo**: (400, 260)
- **Limite de movimento**: 20 pixels das bordas

### Atualizações
- **Posições dos jogadores**: A cada 200ms
- **Heatmap**: A cada 3 segundos
- **Timer**: A cada 1 segundo

## 🚀 Funcionalidades Futuras

- [ ] Integração com dados reais de GPS
- [ ] Sistema de replay
- [ ] Análise de formações táticas
- [ ] Exportação de relatórios
- [ ] Múltiplas partidas simultâneas
- [ ] Dashboard para técnicos
- [ ] Integração com wearables

## 👥 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Pedro Kourly**
- GitHub: [@pedrokourly](https://github.com/pedrokourly)

## 🙏 Agradecimentos

- Comunidade Node.js
- Socket.IO pelos WebSockets
- Chart.js pelos gráficos
- Tailwind CSS pelo design system

---

⚽ **SoccerAnalyze** - Transformando dados em insights para o futebol moderno!
