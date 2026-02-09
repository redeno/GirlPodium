import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
      };
    };
  }
}

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
  const CONSTANT_SPEED = 15;
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

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

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

    ball.x += ball.vx;
    ball.y += ball.vy;

    const dx = ball.x - centerX;
    const dy = ball.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance + ball.radius > RING_RADIUS) {
      const angle = Math.atan2(dy, dx);
      ball.x = centerX + Math.cos(angle) * (RING_RADIUS - ball.radius);
      ball.y = centerY + Math.sin(angle) * (RING_RADIUS - ball.radius);
      
      const normalX = Math.cos(angle);
      const normalY = Math.sin(angle);
      const dot = ball.vx * normalX + ball.vy * normalY;
      
      ball.vx = (ball.vx - 2 * dot * normalX);
      ball.vy = (ball.vy - 2 * dot * normalY);
      
      const currentAngle = Math.atan2(ball.vy, ball.vx);
      const newAngle = currentAngle + (Math.random() - 0.5) * 0.6;
      
      ball.vx = Math.cos(newAngle) * CONSTANT_SPEED;
      ball.vy = Math.sin(newAngle) * CONSTANT_SPEED;

      state.score += 1;
      setScore(state.score);
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
    }

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
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(state.centerX - 200, state.centerY - 250, 40, 0, Math.PI * 2);
    ctx.arc(state.centerX - 160, state.centerY - 270, 50, 0, Math.PI * 2);
    ctx.arc(state.centerX - 120, state.centerY - 250, 40, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(state.centerX, state.centerY, RING_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 20;
    ctx.stroke();
    
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
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
    } else {
      const dx = clientX - state.ball.x;
      const dy = clientY - state.ball.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const angle = Math.atan2(state.ball.y - clientY, state.ball.x - clientX);
        state.ball.vx = Math.cos(angle) * CONSTANT_SPEED;
        state.ball.vy = Math.sin(angle) * CONSTANT_SPEED;
      }
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="block touch-none cursor-crosshair w-full h-full"
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => { e.preventDefault(); handleStart(e.touches[0].clientX, e.touches[0].clientY); }}
      />
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none">
        <div className="bg-black/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
          <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Score</div>
          <div className="text-2xl font-black text-white">{score}</div>
        </div>
        
        {!isPlaying && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-auto w-full px-8">
            <h1 className="text-4xl font-black text-white drop-shadow-xl mb-6">Bounce Ball</h1>
            <div className="animate-pulse">
              <span className="bg-white text-pink-500 px-6 py-3 rounded-full font-bold shadow-2xl text-lg">
                Tap to Start
              </span>
            </div>
          </div>
        )}

        {isPlaying && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="pointer-events-auto rounded-full bg-white/10 hover:bg-white/20 text-white border-white/10"
            onClick={() => {
              if (score > 0) {
                confetti();
                if (window.Telegram?.WebApp?.HapticFeedback) {
                  window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                }
              }
              onGameOver(score);
            }}
          >
            End <RotateCcw className="ml-2 w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}