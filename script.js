const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const centerX = canvas.width / 2;
const centerY = 150; // Центр кольца сверху
const ball = {
    x: centerX,
    y: centerY,
    vx: 0,
    vy: 0,
    radius: 20,
    color: '#ff69b4'
};
let rope = null; // {length: 0, angle: 0, attached: false}
let isRopeActive = false;
const gravity = 0.5;
const ropeStrength = 0.1; // Слабая сила верёвки
const damping = 0.98; // Затухание

// Спавн шарика в кольце
function spawnBall() {
    ball.x = centerX + (Math.random() - 0.5) * 40;
    ball.y = centerY + (Math.random() - 0.5) * 40;
    ball.vx = 0;
    ball.vy = 0;
    rope = null;
    isRopeActive = false;
}

// Обработка клика/касания
canvas.addEventListener('click', handleClick);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleClick(e.touches[0]);
});

function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Проверка касания шарика
    const dx = mouseX - ball.x;
    const dy = mouseY - ball.y;
    if (Math.sqrt(dx*dx + dy*dy) < ball.radius) {
        isRopeActive = true;
        rope = {
            length: 0,
            targetX: mouseX,
            targetY: mouseY
        };
    }
}

// Обновление физики
function update() {
    // Гравитация
    ball.vy += gravity;
    
    if (isRopeActive && rope) {
        const dx = rope.targetX - ball.x;
        const dy = rope.targetY - ball.y;
        rope.length = Math.sqrt(dx*dx + dy*dy);
        const maxLength = 150; // Макс. длина верёвки
        
        if (rope.length > maxLength) {
            // Пружинная сила (мягкая)
            const force = (rope.length - maxLength) * ropeStrength;
            ball.vx += (dx / rope.length) * force;
            ball.vy += (dy / rope.length) * force;
        }
    }
    
    // Движение
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vx *= damping;
    ball.vy *= damping;
    
    // Отскок от стен
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) ball.vx *= -0.8;
    if (ball.y - ball.radius < 0) ball.vy *= -0.8;
    
    // Границы снизу (не улетать)
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy *= -0.6;
    }
}

// Рисование кольца
function drawRing() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
    ctx.stroke();
    
    // Тень кольца
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Рисование верёвки
function drawRope() {
    if (!rope || !isRopeActive) return;
    
    ctx.strokeStyle = '#ff1493';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#ff69b4';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(rope.targetX, rope.targetY);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Рисование шарика
function drawBall() {
    ctx.fillStyle = ball.color;
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Блик
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(ball.x - 8, ball.y - 8, 6, 0, Math.PI * 2);
    ctx.fill();
}

// Игровой цикл
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    drawRing();
    drawRope();
    drawBall();
    requestAnimationFrame(gameLoop);
}

// Старт
spawnBall();
gameLoop();

// Перезапуск по двойному клику (для удобства)
canvas.addEventListener('dblclick', spawnBall);
