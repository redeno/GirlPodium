import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateScore } from '@/hooks/use-scores';
import { Trophy, RefreshCcw, Save } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameOverDialogProps {
  score: number;
  isOpen: boolean;
  onRestart: () => void;
  onClose: () => void;
}

export function GameOverDialog({ score, isOpen, onRestart, onClose }: GameOverDialogProps) {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const createScore = useCreateScore();

  const handleSubmit = async () => {
    if (!username.trim()) return;
    
    try {
      await createScore.mutateAsync({
        username: username.trim(),
        score: score,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestart = () => {
    setSubmitted(false);
    setUsername('');
    onRestart();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-black font-fredoka text-primary">
            Игра Окончена!
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            type="spring"
            className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6 shadow-inner"
          >
            <Trophy className="w-12 h-12 text-yellow-500" />
          </motion.div>
          
          <div className="text-center mb-8">
            <div className="text-muted-foreground font-semibold uppercase tracking-wider text-sm mb-1">
              Твой результат
            </div>
            <div className="text-6xl font-black text-gray-800 font-fredoka">
              {score}
            </div>
          </div>

          {!submitted ? (
            <div className="w-full space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <label className="text-sm font-semibold text-blue-700 mb-2 block">
                  Сохранить результат?
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Введи свое имя..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white border-blue-200 focus:ring-blue-400"
                    maxLength={15}
                  />
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!username.trim() || createScore.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {createScore.isPending ? "..." : <Save className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={handleRestart} 
                className="w-full h-12 text-lg rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                Пропустить и Начать заново
              </Button>
            </div>
          ) : (
            <div className="w-full text-center">
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl font-bold border border-green-100">
                Результат сохранен!
              </div>
              <Button 
                onClick={handleRestart} 
                className="w-full h-14 text-xl rounded-2xl font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
              >
                <RefreshCcw className="mr-2 w-6 h-6" />
                Играть Снова
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
