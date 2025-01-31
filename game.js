const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game state
let gameOver = false;
let startTime = Date.now();
let survivalTime = 0;
let enemySpawnRate = 0.02; // Initial spawn rate
let enemySpeedMultiplier = 1; // Initial speed multiplier

// Player
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  color: 'blue',
  speed: 5,
  gunLength: 30, // Length of the gun
};

// Bullets
const bullets = [];
const bulletSpeed = 7;

// Enemies
const enemies = [];
const baseEnemySpeed = 2;

// Explosions
const explosions = [];

// Handle player movement
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

window.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true;
  }
});

window.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
  }
});

// Handle shooting
window.addEventListener('click', () => {
  if (!gameOver) {
    const angle = Math.atan2(
      mouse.y - player.y,
      mouse.x - player.x
    );
    bullets.push({
      x: player.x,
      y: player.y,
      dx: Math.cos(angle) * bulletSpeed,
      dy: Math.sin(angle) * bulletSpeed,
      radius: 5,
      color: 'yellow',
    });
  }
});

// Mouse position
const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

canvas.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Spawn enemies
function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x, y;
  switch (side) {
    case 0: // Top
      x = Math.random() * canvas.width;
      y = -50;
      break;
    case 1: // Bottom
      x = Math.random() * canvas.width;
      y = canvas.height + 50;
      break;
    case 2: // Left
      x = -50;
      y = Math.random() * canvas.height;
      break;
    case 3: // Right
      x = canvas.width + 50;
      y = Math.random() * canvas.height;
      break;
  }
  enemies.push({
    x,
    y,
    radius: 15,
    color: 'red',
    dx: (player.x - x) / 100 * enemySpeedMultiplier,
    dy: (player.y - y) / 100 * enemySpeedMultiplier,
  });
}

// Update timer
function updateTimer() {
  if (!gameOver) {
    survivalTime = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('timer').textContent = `Time: ${survivalTime}s`;

    // Increase difficulty over time
    enemySpawnRate = 0.02 + survivalTime * 0.001; // Increase spawn rate
    enemySpeedMultiplier = 1 + survivalTime * 0.01; // Increase speed
  }
}

// Game Over
function endGame() {
  gameOver = true;
  document.getElementById('gameOver').style.display = 'block';
  document.getElementById('survivalTime').textContent = survivalTime;
}

// Restart game
function restartGame() {
  document.location.reload();
}

// Draw gun
function drawGun() {
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  const gunEndX = player.x + Math.cos(angle) * player.gunLength;
  const gunEndY = player.y + Math.sin(angle) * player.gunLength;

  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(gunEndX, gunEndY);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.closePath();
}

// Player animation (pulsating effect)
let pulseDirection = 1; // 1 for growing, -1 for shrinking

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.closePath();

  // Pulsating effect
  if (player.radius >= 25) pulseDirection = -1;
  if (player.radius <= 15) pulseDirection = 1;
  player.radius += 0.1 * pulseDirection;
}

// Bullet animation (trail effect)
function drawBullet(bullet) {
  // Draw bullet
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
  ctx.fillStyle = bullet.color;
  ctx.fill();
  ctx.closePath();

  // Trail effect
  ctx.beginPath();
  ctx.moveTo(bullet.x - bullet.dx * 5, bullet.y - bullet.dy * 5);
  ctx.lineTo(bullet.x, bullet.y);
  ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
}

// Enemy animation (wobble effect)
function drawEnemy(enemy) {
  // Wobble effect
  enemy.x += Math.sin(Date.now() * 0.01) * 0.5;
  enemy.y += Math.cos(Date.now() * 0.01) * 0.5;

  // Draw enemy
  ctx.beginPath();
  ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
  ctx.fillStyle = enemy.color;
  ctx.fill();
  ctx.closePath();
}

// Explosion animation
function createExplosion(x, y) {
  explosions.push({
    x,
    y,
    radius: 10,
    maxRadius: 30,
    color: 'orange',
    alpha: 1,
  });
}

function drawExplosions() {
  explosions.forEach((explosion, index) => {
    explosion.radius += 1;
    explosion.alpha -= 0.05;

    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 165, 0, ${explosion.alpha})`;
    ctx.fill();
    ctx.closePath();

    if (explosion.alpha <= 0) {
      explosions.splice(index, 1);
    }
  });
}

// Game loop
function gameLoop() {
  if (!gameOver) {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    drawPlayer();

    // Draw gun
    drawGun();

    // Move player
    if (keys.ArrowUp && player.y > player.radius) player.y -= player.speed;
    if (keys.ArrowDown && player.y < canvas.height - player.radius) player.y += player.speed;
    if (keys.ArrowLeft && player.x > player.radius) player.x -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width - player.radius) player.x += player.speed;

    // Draw and move bullets
    bullets.forEach((bullet, index) => {
      bullet.x += bullet.dx;
      bullet.y += bullet.dy;

      // Remove bullets off-screen
      if (
        bullet.x < 0 || bullet.x > canvas.width ||
        bullet.y < 0 || bullet.y > canvas.height
      ) {
        bullets.splice(index, 1);
      }

      // Draw bullet
      drawBullet(bullet);
    });

    // Draw and move enemies
    enemies.forEach((enemy, index) => {
      enemy.x += enemy.dx;
      enemy.y += enemy.dy;

      // Draw enemy
      drawEnemy(enemy);

      // Check collision with player
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (dist < player.radius + enemy.radius) {
        endGame();
      }

      // Check collision with bullets
      bullets.forEach((bullet, bulletIndex) => {
        const bulletDist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
        if (bulletDist < bullet.radius + enemy.radius) {
          // Remove enemy and bullet
          enemies.splice(index, 1);
          bullets.splice(bulletIndex, 1);
          // Create explosion
          createExplosion(enemy.x, enemy.y);
        }
      });
    });

    // Draw explosions
    drawExplosions();

    // Spawn enemies
    if (Math.random() < enemySpawnRate) {
      spawnEnemy();
    }

    // Update timer
    updateTimer();
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();