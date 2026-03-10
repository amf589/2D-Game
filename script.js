const arena = document.getElementById('arena');
const p1El = document.getElementById('player1');
const p2El = document.getElementById('player2');
const p1HealthEl = document.getElementById('p1Health');
const p2HealthEl = document.getElementById('p2Health');
const timerEl = document.getElementById('timer');
const messageEl = document.getElementById('message');

const arenaWidth = () => arena.clientWidth;
const gravity = 0.8;
const roundTime = 60;

const player1 = {
  el: p1El,
  x: 110,
  y: 0,
  width: 52,
  height: 92,
  speed: 4,
  vx: 0,
  vy: 0,
  facing: 1,
  health: 100,
  isAttacking: false,
  attackCooldown: false,
  keys: { left: false, right: false },
  controls: { left: 'a', right: 'd', jump: 'w', attack: 'f' }
};

const player2 = {
  el: p2El,
  x: 730,
  y: 0,
  width: 52,
  height: 92,
  speed: 4,
  vx: 0,
  vy: 0,
  facing: -1,
  health: 100,
  isAttacking: false,
  attackCooldown: false,
  keys: { left: false, right: false },
  controls: { left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', attack: 'l' }
};

let gameOver = false;
let timeLeft = roundTime;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateFacing() {
  player1.facing = player1.x < player2.x ? 1 : -1;
  player2.facing = player2.x < player1.x ? 1 : -1;
}

function updateMovement(player) {
  if (player.keys.left && !player.keys.right) player.vx = -player.speed;
  else if (player.keys.right && !player.keys.left) player.vx = player.speed;
  else player.vx = 0;

  player.x += player.vx;
  player.x = clamp(player.x, 0, arenaWidth() - player.width);

  player.vy += gravity;
  player.y += player.vy;

  if (player.y <= 0) {
    player.y = 0;
    player.vy = 0;
  }
}

function updateRender(player) {
  const floorOffset = player.y;
  player.el.style.left = `${player.x}px`;
  player.el.style.bottom = `${floorOffset}px`;
  player.el.style.transform = `scaleX(${player.facing})`;
}

function boxesOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function attack(attacker, defender) {
  if (attacker.attackCooldown || gameOver) return;

  attacker.isAttacking = true;
  attacker.attackCooldown = true;
  attacker.el.classList.add('attacking');

  const range = 48;
  const hitbox = {
    x: attacker.facing === 1 ? attacker.x + attacker.width : attacker.x - range,
    y: attacker.y,
    width: range,
    height: attacker.height
  };

  const defenderBox = {
    x: defender.x,
    y: defender.y,
    width: defender.width,
    height: defender.height
  };

  if (boxesOverlap(hitbox, defenderBox)) {
    defender.health = clamp(defender.health - 10, 0, 100);
    updateHealthUI();
    if (defender.health === 0) endGame();
  }

  setTimeout(() => {
    attacker.isAttacking = false;
    attacker.el.classList.remove('attacking');
  }, 130);

  setTimeout(() => {
    attacker.attackCooldown = false;
  }, 380);
}

function updateHealthUI() {
  p1HealthEl.style.width = `${player1.health}%`;
  p2HealthEl.style.width = `${player2.health}%`;
}

function endGame() {
  gameOver = true;
  if (player1.health === player2.health) {
    messageEl.textContent = 'Draw!';
  } else {
    messageEl.textContent = player1.health > player2.health ? 'Player 1 Wins!' : 'Player 2 Wins!';
  }
}

function gameLoop() {
  if (!gameOver) {
    updateFacing();
    updateMovement(player1);
    updateMovement(player2);
    updateRender(player1);
    updateRender(player2);
    requestAnimationFrame(gameLoop);
  }
}

function startTimer() {
  const timer = setInterval(() => {
    if (gameOver) {
      clearInterval(timer);
      return;
    }

    timeLeft -= 1;
    timerEl.textContent = `${timeLeft}`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

window.addEventListener('keydown', (e) => {
  if (gameOver) return;

  if (e.key === player1.controls.left) player1.keys.left = true;
  if (e.key === player1.controls.right) player1.keys.right = true;
  if (e.key === player2.controls.left) player2.keys.left = true;
  if (e.key === player2.controls.right) player2.keys.right = true;

  if (e.key === player1.controls.jump && player1.y === 0) player1.vy = 14;
  if (e.key === player2.controls.jump && player2.y === 0) player2.vy = 14;

  if (e.key.toLowerCase() === player1.controls.attack) attack(player1, player2);
  if (e.key.toLowerCase() === player2.controls.attack) attack(player2, player1);
});

window.addEventListener('keyup', (e) => {
  if (e.key === player1.controls.left) player1.keys.left = false;
  if (e.key === player1.controls.right) player1.keys.right = false;
  if (e.key === player2.controls.left) player2.keys.left = false;
  if (e.key === player2.controls.right) player2.keys.right = false;
});

updateHealthUI();
updateRender(player1);
updateRender(player2);
startTimer();
requestAnimationFrame(gameLoop);
