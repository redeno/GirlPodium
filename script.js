const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Адаптивный ресайз canvas под весь экран
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Начальный ресайз

let centerX, centerY; // Будут пересчитываться при ресайзе
const ringRadius = 120; // Большое кольцо
const ball = {
    x: 0, y: 0, vx: 0, vy: 0,
    radius: 25,
    color: '#ff69b4'
};
let rope = null;
let isRopeActive = false;
const gravity = 0.4;
const ropeStrength = 0.08;
const damping = 0.97;

function spawnBall() {
    centerX = canvas.width * 0.5;
    centerY = canvas.height * 0.25; // Кольцо сверху экрана
    ball.x = centerX + (Math.random() - 0.5) * ringRadius * 0.6;
    ball.y = centerY + (Math.random() - 0.5) * ringRadius * 0.6;
    ball.vx = 0;
    ball.vy = 0;
    rope = null;
    isRopeActive = false;
}

// Коллизия с кольцом - шарик НЕ выходит за пределы!
function constrainToRing() {
    const dx = ball.x - centerX;
    const dy = ball.y - centerY;
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    if (distance + ball.radius > ringRadius) {
        // Пружина кольца отталкивает обратно
        const angle = Math.atan2(dy, dx);
        ball.x = centerX + Math.cos(angle) * (ringRadius - ball.radius);
        ball.y = centerY + Math.sin(angle) * (ringRadius - ball.radius);
        
        // Отскок скорости
        const speed = Math.sqrt(ball.vx*ball.vx + ball.vy*ball.vy);
        ball.vx = -Math.cos(angle) * speed * 0.6;
        ball.vy = -Math.sin(angle) * speed * 0.6;
    }
}

// Обработка касания
function getEventPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX || e.touches[0].clientX) - rect.left,
        y: (e.clientY || e.touches[0].clientY) - rect.top
    };
}

canvas.addEventListener('click', (e) => {
    const pos = getEventPos(e);
    checkRopeAttach(pos.x, pos.y);
});
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const pos = getEventPos(e.touches[0]);
    checkRopeAttach(pos.x, pos.y);
});

function checkRopeAttach(mx, my) {
    const dx = mx - ball.x;
    const dy = my - ball.y;
    if (Math.sqrt(dx*dx + dy*dy) < ball.radius * 1.5) {
        isRopeActive = true;
        rope = { targetX: mx, targetY: my };
    }
}

// Обработка движения мыши/пальца для верёвки
canvas.addEventListener('mousemove', (e) => {
    if (isRopeActive && rope) {
        const pos = getEventPos(e);
        rope.targetX = pos.x;
        rope.targetY = pos.y;
    }
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isRopeActive && rope) {
        const pos = getEventPos(e.touches[0]);
        rope.targetX = pos.x;
        rope.targetY = pos.y;
    }
});

// Отпускание верёвки
canvas.addEventListener('mouseup', () => isRopeActive = false);
canvas.addEventListener('touchend', () => isRopeActive = false);

function update() {
    centerX = canvas.width * 0.5;
    centerY = canvas.height * 0.25;
    
    // Гравитация
    ball.vy += gravity;
    
    // Верёвка
    if (isRopeActive && rope) {
        const dx = rope.targetX - ball.x;
        const dy = rope.targetY - ball.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const maxLength = 200;
        
        if (dist > maxLength) {
            const force = (dist - maxLength) * ropeStrength;
            ball.vx += (dx / dist) * force;
            ball.vy += (dy / dist) * force;
        }
    }
    
    // Движение
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vx *= damping;
    ball.vy *= damping;
    
    // ВЕЧНАЯ КОЛЛИЗИЯ С КОЛЬЦОМ
    constrainToRing();
    
    // Границы экрана (снизу)
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy *= -0.5;
    }
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.vx *= -0.7;
    }
}

function drawRing() {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 12;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawRope() {
    if (!rope || !isRopeActive) return;
    ctx.strokeStyle = '#ff1493';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#ff69b4';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(rope.targetX, rope.targetY);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.fillStyle = ball.color;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Блик
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(ball.x - 10, ball.y - 10, 8, 0, Math.PI * 2);
    ctx.fill();
}

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
