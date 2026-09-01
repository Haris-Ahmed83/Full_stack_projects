// --- WebSocket Connection ---
const ws = new WebSocket('ws://localhost:8080'); // Connect to your WebSocket server

let playerId = null; // This client's unique ID assigned by the server
let gameState = {};  // The overall game state received from the server
let inputState = {   // Current input state to send to the server
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false // Example action
};

const INPUT_SEND_INTERVAL = 1000 / 30; // Send input to server 30 times per second

ws.onopen = () => {
    console.log('Connected to WebSocket server.');
    // If rooms are explicit, you might send a 'joinRoom' message here:
    // ws.send(JSON.stringify({ type: 'joinRoom', roomId: 'defaultRoom' }));
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    switch (message.type) {
        case 'init':
            playerId = message.id;
            console.log('Received player ID:', playerId);
            break;
        case 'state':
            // Update local game state with the latest from the server
            gameState = message.state;
            break;
        case 'error':
            console.error('Server error:', message.message);
            break;
        // Add more message types as needed (e.g., 'gameOver', 'roomFull')
    }
};

ws.onclose = () => {
    console.log('Disconnected from WebSocket server.');
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

// --- Canvas Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial canvas size setup

// --- Game Drawing Function ---
function draw() {
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Display a loading message if game state hasn't been received yet
    if (!gameState.players) {
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for game state...', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Draw players
    for (const id in gameState.players) {
        const player = gameState.players[id];
        ctx.fillStyle = player.color || (id === playerId ? 'cyan' : 'red'); // Highlight current player
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw player name/ID
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name || `Player ${id.substring(0, 4)}`, player.x, player.y - player.radius - 5);

        // Draw health bar (simple example)
        if (player.health !== undefined && player.maxHealth !== undefined) {
            const barWidth = player.radius * 2;
            const barHeight = 4;
            const healthRatio = player.health / player.maxHealth;
            ctx.fillStyle = 'grey';
            ctx.fillRect(player.x - player.radius, player.y + player.radius + 5, barWidth, barHeight);
            ctx.fillStyle = healthRatio > 0.5 ? 'green' : (healthRatio > 0.2 ? 'orange' : 'red');
            ctx.fillRect(player.x - player.radius, player.y + player.radius + 5, barWidth * healthRatio, barHeight);
        }
    }

    // Draw projectiles (if your game has them)
    if (gameState.projectiles) {
        gameState.projectiles.forEach(proj => {
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Draw other game objects (e.g., obstacles, pickups)
    if (gameState.obstacles) {
        gameState.obstacles.forEach(obstacle => {
            ctx.fillStyle = 'darkgrey';
            ctx.fillRect(obstacle.x - obstacle.width / 2, obstacle.y - obstacle.height / 2, obstacle.width, obstacle.height);
        });
    }

    // Display current player's score/info on screen
    if (playerId && gameState.players[playerId]) {
        const currentPlayer = gameState.players[playerId];
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${currentPlayer.score || 0}`, 10, 20);
        ctx.fillText(`Health: ${currentPlayer.health || 100}`, 10, 40);
    }
}

// --- Game Loop ---
function gameLoop() {
    draw(); // Redraw the game state
    requestAnimationFrame(gameLoop); // Schedule next frame
}

// Start the client-side game loop
gameLoop();

// --- Input Handling ---
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
        case 'ArrowUp':
            inputState.up = true;
            break;
        case 's':
        case 'ArrowDown':
            inputState.down = true;
            break;
        case 'a':
        case 'ArrowLeft':
            inputState.left = true;
            break;
        case 'd':
        case 'ArrowRight':
            inputState.right = true;
            break;
        case ' ': // Spacebar for shooting
            inputState.shoot = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
        case 'ArrowUp':
            inputState.up = false;
            break;
        case 's':
        case 'ArrowDown':
            inputState.down = false;
            break;
        case 'a':
        case 'ArrowLeft':
            inputState.left = false;
            break;
        case 'd':
        case 'ArrowRight':
            inputState.right = false;
            break;
        case ' ':
            inputState.shoot = false;
            break;
    }
});

// Periodically send the current input state to the server
setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', input: inputState }));
    }
}, INPUT_SEND_INTERVAL);
