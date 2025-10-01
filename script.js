const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const gameOverText = document.getElementById("game-over");

let box = 20; // grid size
let snake = [{ x: 9 * box, y: 10 * box }];
let direction;
let food = spawnFood();
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
highScoreDisplay.textContent = highScore;
let gameLoop;
let speed = 120;

// Listen for controls
document.addEventListener("keydown", setDirection);

function setDirection(e) {
  if ((e.key === "ArrowLeft" || e.key === "a") && direction !== "RIGHT") direction = "LEFT";
  else if ((e.key === "ArrowUp" || e.key === "w") && direction !== "DOWN") direction = "UP";
  else if ((e.key === "ArrowRight" || e.key === "d") && direction !== "LEFT") direction = "RIGHT";
  else if ((e.key === "ArrowDown" || e.key === "s") && direction !== "UP") direction = "DOWN";
  else if (e.key === "Enter" && gameLoop == null) restartGame();
}

function spawnFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box
  };
}

function draw() {
  // Draw background
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "lime" : "lightgreen";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);

    ctx.strokeStyle = "#111";
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  // Draw food
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x + box/2, food.y + box/2, box/2, 0, Math.PI * 2);
  ctx.fill();

  // Old head
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  // Direction
  if (direction === "LEFT") snakeX -= box;
  if (direction === "UP") snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN") snakeY += box;

  // Eat food
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    scoreDisplay.textContent = score;
    food = spawnFood();
    // Increase speed every 5 points
    if (score % 5 === 0 && speed > 60) {
      clearInterval(gameLoop);
      speed -= 5;
      gameLoop = setInterval(draw, speed);
    }
  } else {
    snake.pop(); // remove tail
  }

  // Add new head
  const newHead = { x: snakeX, y: snakeY };

  // Game over check
  if (
    snakeX < 0 || snakeY < 0 ||
    snakeX >= canvas.width || snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    endGame();
    return;
  }

  snake.unshift(newHead);
}

function collision(head, array) {
  return array.some(segment => segment.x === head.x && segment.y === head.y);
}

function endGame() {
  clearInterval(gameLoop);
  gameLoop = null;
  gameOverText.style.display = "block";
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("snakeHighScore", highScore);
    highScoreDisplay.textContent = highScore;
  }
}

function restartGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = null;
  food = spawnFood();
  score = 0;
  scoreDisplay.textContent = score;
  speed = 120;
  gameOverText.style.display = "none";
  gameLoop = setInterval(draw, speed);
}

// Start the game
restartGame();

