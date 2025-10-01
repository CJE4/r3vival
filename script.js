const game = document.getElementById("game");
const dino = document.getElementById("dino");
const scoreDisplay = document.getElementById("score");
const gameOverText = document.getElementById("game-over");

let isJumping = false;
let gravity = 0.9;
let position = 0;
let score = 0;
let gameSpeed = 5;
let gameOver = false;

function jump() {
  if (isJumping) return;
  isJumping = true;
  let velocity = 15;

  const jumpInterval = setInterval(() => {
    if (velocity <= 0 && position <= 0) {
      clearInterval(jumpInterval);
      isJumping = false;
      position = 0;
      dino.style.bottom = position + "px";
      return;
    }
    position += velocity;
    velocity -= gravity;
    if (position < 0) position = 0;
    dino.style.bottom = position + "px";
  }, 20);
}

function createObstacle() {
  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");
  let obstaclePosition = 800;
  game.appendChild(obstacle);

  const moveInterval = setInterval(() => {
    if (gameOver) {
      clearInterval(moveInterval);
      obstacle.remove();
      return;
    }

    obstaclePosition -= gameSpeed;
    obstacle.style.right = 800 - obstaclePosition + "px";

    // Collision detection
    let dinoBottom = parseInt(window.getComputedStyle(dino).getPropertyValue("bottom"));
    if (obstaclePosition < 90 && obstaclePosition > 40 && dinoBottom < 40) {
      gameOver = true;
      gameOverText.style.display = "block";
    }

    if (obstaclePosition < -20) {
      clearInterval(moveInterval);
      obstacle.remove();
      score++;
      scoreDisplay.textContent = score;
      if (score % 5 === 0) gameSpeed += 0.5;
    }
  }, 20);

  if (!gameOver) {
    setTimeout(createObstacle, Math.random() * 2000 + 1000);
  }
}

function createCloud() {
  const cloud = document.createElement("div");
  cloud.classList.add("cloud");
  let cloudPosition = 800;
  cloud.style.top = Math.random() * 80 + 20 + "px";
  game.appendChild(cloud);

  const cloudInterval = setInterval(() => {
    if (gameOver) {
      clearInterval(cloudInterval);
      cloud.remove();
      return;
    }
    cloudPosition -= 2;
    cloud.style.right = 800 - cloudPosition + "px";

    if (cloudPosition < -60) {
      clearInterval(cloudInterval);
      cloud.remove();
    }
  }, 40);

  if (!gameOver) {
    setTimeout(createCloud, Math.random() * 5000 + 2000);
  }
}

document.addEventListener("keydown", e => {
  if ((e.code === "Space" || e.code === "ArrowUp") && !gameOver) {
    jump();
  } else if (gameOver && e.code === "Space") {
    restartGame();
  }
});

function restartGame() {
  gameOver = false;
  score = 0;
  gameSpeed = 5;
  scoreDisplay.textContent = score;
  gameOverText.style.display = "none";
  document.querySelectorAll(".obstacle, .cloud").forEach(el => el.remove());
  createObstacle();
  createCloud();
}

// Start game
createObstacle();
createCloud();
