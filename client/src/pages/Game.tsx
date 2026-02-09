import { useState } from 'react';
import { GameEngine } from '@/components/game/GameEngine';
import { Leaderboard } from '@/components/ui/leaderboard';
import { GameOverDialog } from '@/components/ui/game-over-dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Trophy } from 'lucide-react';

export default function GamePage() {
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [finalScore, setFinalScore] = useState(0);

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setGameState('gameover');
  };

  const handleRestart = () => {
    setGameState('playing');
    // Force re-mount of GameEngine to reset all canvas state
    // We can do this by using a key that changes
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-transparent to-transparent"></div>

      {/* Main Game Canvas */}
      <GameEngine 
        key={gameState === 'playing' ? 'game-active' : 'game-paused'} 
        onGameOver={handleGameOver} 
      />

      {/* Floating Action Button for Leaderboard (Mobile Friendly) */}
      <div className="absolute bottom-6 right-6 z-10">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              size="icon" 
              className="w-14 h-14 rounded-full shadow-xl bg-white text-yellow-500 hover:bg-yellow-50 hover:scale-110 transition-all border-4 border-yellow-100"
            >
              <Trophy className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] bg-white/80 backdrop-blur-lg border-l border-white/50">
            <SheetTitle className="sr-only">Leaderboard</SheetTitle>
            <div className="mt-8">
              <Leaderboard />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Game Over Modal */}
      <GameOverDialog
        isOpen={gameState === 'gameover'}
        score={finalScore}
        onRestart={handleRestart}
        onClose={() => setGameState('playing')} // Just close dialog without restarting if needed
      />
    </div>
  );
}
