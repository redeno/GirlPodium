import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameEngineProps {
  onGameOver: (score: number) => void;
}

interface Point {
  x: number;
  y: number;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export function GameEngine({ onGameOver }: GameEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const requestRef = useRef<number>();
  
  // Physics Constants
  const RING_RADIUS = 320;
  const CONSTANT_SPEED = 15; // Maintain a constant velocity
  const START_VY_OFFSET = -6;

  const gameState = useRef({
    ball: { 
      x: 0, 
      y: 0, 
      vx: 0, 
      vy: 0, 
      radius: 25, 
      color: '#ff69b4' 
    } as Ball,
    started: false,
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    score: 0
  });

  const initGame = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    gameState.current.width = canvas.width;
    gameState.current.height = canvas.height;
    gameState.current.centerX = canvas.width / 2;
    gameState.current.centerY = canvas.height * 0.45;
    
    gameState.current.ball = {
      x: gameState.current.centerX,
      y: gameState.current.centerY,
      vx: 0,
      vy: 0,
      radius: 25,
      color: '#ff69b4'
    };
    gameState.current.started = false;
    gameState.current.score = 0;
    
    setScore(0);
    setIsPlaying(false);
  }, []);

  const updatePhysics = () => {
    const state = gameState.current;
    const { ball, centerX, centerY } = state;

    if (!state.started) return;

    // Constant motion
    ball.x += ball.vx;
    ball.y += ball.vy;

    const dx = ball.x - centerX;
    const dy = ball.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance + ball.radius > RING_RADIUS) {
      const angle = Math.atan2(dy, dx);
      
      // Position correction
      ball.x = centerX + Math.cos(angle) * (RING_RADIUS - ball.radius);
      ball.y = centerY + Math.sin(angle) * (RING_RADIUS - ball.radius);
      
      // Bounce reflection
      const normalX = Math.cos(angle);
      const normalY = Math.sin(angle);
      const dot = ball.vx * normalX + ball.vy * normalY;
      
      // Reflect velocity
      ball.vx = (ball.vx - 2 * dot * normalX);
      ball.vy = (ball.vy - 2 * dot * normalY);
      
      // Add randomness and normalize to CONSTANT_SPEED
      const currentAngle = Math.atan2(ball.vy, ball.vx);
      const newAngle = currentAngle + (Math.random() - 0.5) * 0.6;
      
      ball.vx = Math.cos(newAngle) * CONSTANT_SPEED;
      ball.vy = Math.sin(newAngle) * CONSTANT_SPEED;

      state.score += 1;
      setScore(state.score);
    }

    // Ensure speed is always normalized
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (speed > 0 && Math.abs(speed - CONSTANT_SPEED) > 0.01) {
      ball.vx = (ball.vx / speed) * CONSTANT_SPEED;
      ball.vy = (ball.vy / speed) * CONSTANT_SPEED;
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const state = gameState.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(state.centerX - 200, state.centerY - 250, 40, 0, Math.PI * 2);
    ctx.arc(state.centerX - 160, state.centerY - 270, 50, 0, Math.PI * 2);
    ctx.arc(state.centerX - 120, state.centerY - 250, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw Ring
    ctx.beginPath();
    ctx.arc(state.centerX, state.centerY, RING_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 20;
    ctx.stroke();
    
    // Draw Ball
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = state.ball.color;
    ctx.fill();
    
    updatePhysics();
    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    initGame();
    requestRef.current = requestAnimationFrame(draw);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [initGame]);

  const handleStart = (clientX: number, clientY: number) => {
    const state = gameState.current;
    if (!state.started) {
      state.started = true;
      setIsPlaying(true);
      const randomAngle = (Math.random() - 0.5) * Math.PI - Math.PI/2;
      state.ball.vx = Math.cos(randomAngle) * CONSTANT_SPEED;
      state.ball.vy = Math.sin(randomAngle) * CONSTANT_SPEED;
    } else {
      // Direct push logic removed to keep speed constant
      const dx = clientX - state.ball.x;
      const dy = clientY - state.ball.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        // Just a visual feedback or slight nudge without speed change
        const angle = Math.atan2(state.ball.y - clientY, state.ball.x - clientX);
        state.ball.vx = Math.cos(angle) * CONSTANT_SPEED;
        state.ball.vy = Math.sin(angle) * CONSTANT_SPEED;
      }
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="block touch-none cursor-crosshair"
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => { e.preventDefault(); handleStart(e.touches[0].clientX, e.touches[0].clientY); }}
      />
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none">
        <div className="bg-white/20 backdrop-blur-md rounded-lg px-6 py-3 border border-white/30">
          <div className="text-xs font-bold text-white/70 uppercase tracking-widest">Score</div>
          <div className="text-4xl font-black text-white">{score}</div>
        </div>
        
        {!isPlaying && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-auto">
            <h1 className="text-6xl font-black text-white drop-shadow-lg mb-8">Прыгающий Мяч</h1>
            <div className="animate-bounce">
              <span className="bg-white text-pink-500 px-8 py-4 rounded-full font-bold shadow-xl text-2xl">
                Нажми для старта
              </span>
            </div>
          </div>
        )}

        {isPlaying && (
          <Button 
            variant="destructive" 
            size="lg" 
            className="pointer-events-auto rounded-full shadow-lg"
            onClick={() => {
              if (score > 0) confetti();
              onGameOver(score);
            }}
          >
            Stop <RotateCcw className="ml-2 w-4 h-4" />
          </Button>
        )}
      </div>
    </>
  );
}