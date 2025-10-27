const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");
const msg = document.getElementById("msg");

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// CHAOTIC SIZES
let PADDLE_WIDTH = 12;
let PADDLE_HEIGHT = 90;
let BALL_RADIUS = 16 + Math.random() * 12;

// Paddle positions & velocities
let leftPaddleY = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2;
let rightPaddleY = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2;
let leftPaddleSpeed = 0;
let rightPaddleSpeed = 0;

// Ball position & velocity
let ballX = CANVAS_WIDTH / 2;
let ballY = CANVAS_HEIGHT / 2;
let ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 5);
let ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 5);

// Scores, chaos meter, colors, and randomness
let leftScore = 0;
let rightScore = 0;
let chaos = 13;
let colors = ["#ff00cc", "#fffb00", "#00ffcc", "#00ff00", "#ff0000", "#00f0ff", "#ffffff"];
let ballColor = randomColor();
let paddleColor = randomColor();

// Mouse control, but... chaos
canvas.addEventListener('mousemove', function(evt) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    // CHAOTIC: paddle moves more or less than mouse!
    leftPaddleY += (mouseY - (leftPaddleY + PADDLE_HEIGHT/2)) * (0.5 + Math.random());
    // Clamp
    if (leftPaddleY < 0) leftPaddleY = 0;
    if (leftPaddleY + PADDLE_HEIGHT > CANVAS_HEIGHT)
        leftPaddleY = CANVAS_HEIGHT - PADDLE_HEIGHT;
});

function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function randomMessage() {
    const msgs = [
        "DISCORDANT!", "WHAT IS HAPPENING?", "PONG?", "IS THIS EVEN LEGAL?", 
        "CHAOS IS A LADDER", "MORE SPEED!", "UNPREDICTABLE!", "STOP!", 
        "PADDLE DANCE", "BALL ESCAPE", "WHO WINS?", "???", "HOW DID THAT HAPPEN?", "LOL"
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
}

// CHAOTIC GAME LOOP
function gameLoop() {
    update();
    draw();
    setTimeout(gameLoop, 1000 / (55 + Math.random() * 35)); // Unstable FPS!
}

function update() {
    // Randomly change paddle sizes
    if (Math.random() < 0.07) {
        PADDLE_HEIGHT = 60 + Math.random() * 140;
        PADDLE_WIDTH = 5 + Math.random() * 28;
    }
    // Ball grows/shrinks sometimes
    if (Math.random() < 0.04) BALL_RADIUS = 8 + Math.random() * 22;

    // Ball color/paddle color chaos
    if (Math.random() < 0.13) ballColor = randomColor();
    if (Math.random() < 0.11) paddleColor = randomColor();

    // Ball changes direction randomly
    if (Math.random() < 0.022) {
        ballSpeedX *= -1.2;
        ballSpeedY = (Math.random() - 0.5) * 24;
        msg.textContent = randomMessage();
    }

    // Move ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with top/bottom walls (sometimes bounces extra hard!)
    if (ballY - BALL_RADIUS < 0) {
        ballY = BALL_RADIUS;
        ballSpeedY = -ballSpeedY * (1.05 + Math.random() * 0.3);
        msg.textContent = "UPPER CHAOS!";
    }
    if (ballY + BALL_RADIUS > CANVAS_HEIGHT) {
        ballY = CANVAS_HEIGHT - BALL_RADIUS;
        ballSpeedY = -ballSpeedY * (1.05 + Math.random() * 0.3);
        msg.textContent = "LOWER CHAOS!";
    }

    // Ball collision with left paddle (sometimes ignores physics!)
    if (
        ballX - BALL_RADIUS < PADDLE_WIDTH + Math.random() * 20 &&
        ballY > leftPaddleY &&
        ballY < leftPaddleY + PADDLE_HEIGHT &&
        Math.random() > 0.18 // sometimes it goes through!
    ) {
        ballX = PADDLE_WIDTH + BALL_RADIUS + Math.random() * 8;
        ballSpeedX = -ballSpeedX * (1.07 + Math.random() * 0.35);
        ballSpeedY = (Math.random() - 0.5) * 16 + (ballY - (leftPaddleY + PADDLE_HEIGHT / 2)) * (0.18 + Math.random() * 0.4);
        msg.textContent = randomMessage();
    }

    // Ball collision with right paddle
    if (
        ballX + BALL_RADIUS > CANVAS_WIDTH - PADDLE_WIDTH - Math.random() * 20 &&
        ballY > rightPaddleY &&
        ballY < rightPaddleY + PADDLE_HEIGHT &&
        Math.random() > 0.18
    ) {
        ballX = CANVAS_WIDTH - PADDLE_WIDTH - BALL_RADIUS - Math.random() * 8;
        ballSpeedX = -ballSpeedX * (1.07 + Math.random() * 0.35);
        ballSpeedY = (Math.random() - 0.5) * 16 + (ballY - (rightPaddleY + PADDLE_HEIGHT / 2)) * (0.18 + Math.random() * 0.4);
        msg.textContent = randomMessage();
    }

    // Ball out of bounds - left/right wall
    if (ballX - BALL_RADIUS < 0) {
        rightScore += Math.floor(Math.random() * 3 + 1); // random points!
        resetBall();
        msg.textContent = "RIGHT WINS? MAYBE.";
    }
    if (ballX + BALL_RADIUS > CANVAS_WIDTH) {
        leftScore += Math.floor(Math.random() * 3 + 1);
        resetBall();
        msg.textContent = "LEFT WINS? WHO KNOWS.";
    }

    // Move right paddle (chaotic AI)
    let paddleTarget = ballY + Math.sin(Date.now()/111) * 70;
    if (Math.random() < 0.4) {
        paddleTarget = Math.random() * CANVAS_HEIGHT;
    }
    if (rightPaddleY + PADDLE_HEIGHT / 2 < paddleTarget - 22) {
        rightPaddleY += 8 + Math.random() * 8;
    } else if (rightPaddleY + PADDLE_HEIGHT / 2 > paddleTarget + 22) {
        rightPaddleY -= 8 + Math.random() * 8;
    }
    // Clamp AI paddle
    if (rightPaddleY < 0) rightPaddleY = 0;
    if (rightPaddleY + PADDLE_HEIGHT > CANVAS_HEIGHT)
        rightPaddleY = CANVAS_HEIGHT - PADDLE_HEIGHT;
}

function resetBall() {
    ballX = CANVAS_WIDTH / 2 + Math.random() * 100 - 50;
    ballY = CANVAS_HEIGHT / 2 + Math.random() * 100 - 50;
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 7);
    ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 8);
    BALL_RADIUS = 8 + Math.random() * 22;
    ballColor = randomColor();
    paddleColor = randomColor();
}

function draw() {
    // CHAOTIC CLEAR
    ctx.save();
    if (Math.random() < 0.07) {
        ctx.globalAlpha = 0.72;
        ctx.fillStyle = randomColor();
    } else {
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#222";
    }
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();

    // Draw center line (now, a wavy chaos line)
    ctx.save();
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    for (let y = 0; y < CANVAS_HEIGHT; y += 8) {
        ctx.lineTo(CANVAS_WIDTH / 2 + Math.sin(y/19)*16, y);
    }
    ctx.strokeStyle = randomColor();
    ctx.lineWidth = 4 + Math.random() * 6;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Paddles
    ctx.save();
    ctx.shadowColor = paddleColor;
    ctx.shadowBlur = 15 + Math.random() * 24;
    ctx.fillStyle = paddleColor;
    ctx.fillRect(0, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, rightPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.restore();

    // Ball
    ctx.save();
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2, false);
    ctx.fillStyle = ballColor;
    ctx.shadowColor = randomColor();
    ctx.shadowBlur = 25 + Math.random() * 30;
    ctx.fill();
    ctx.restore();

    // Scores - random positions
    ctx.save();
    ctx.font = `${30 + Math.random()*28}px Comic Sans MS, Arial`;
    ctx.fillStyle = randomColor();
    ctx.globalAlpha = 0.82 + Math.random() * 0.18;
    ctx.fillText(leftScore, CANVAS_WIDTH * (0.16 + Math.random()*0.05), 70 + Math.random()*12);
    ctx.fillStyle = randomColor();
    ctx.fillText(rightScore, CANVAS_WIDTH * (0.77 + Math.random()*0.05), 70 + Math.random()*12);
    ctx.restore();
}

gameLoop();
