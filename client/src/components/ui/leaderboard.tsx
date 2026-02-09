import { useScores } from '@/hooks/use-scores';
import { motion } from 'framer-motion';
import { Trophy, Medal, User } from 'lucide-react';

export function Leaderboard() {
  const { data: scores, isLoading } = useScores();

  // Sort scores descending
  const sortedScores = scores?.sort((a, b) => b.score - a.score).slice(0, 10) || [];

  return (
    <div className="glass-panel p-6 w-full max-w-md mx-auto h-[60vh] overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-yellow-100 p-3 rounded-full">
          <Trophy className="w-6 h-6 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Топ Игроков</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/50 rounded-xl animate-pulse" />
          ))
        ) : sortedScores.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            Пока нет результатов. Стань первым!
          </div>
        ) : (
          sortedScores.map((score, index) => (
            <motion.div
              key={score.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group flex items-center bg-white/60 hover:bg-white/90 transition-colors p-3 rounded-xl shadow-sm border border-white/50"
            >
              <div className="w-10 h-10 flex items-center justify-center font-bold text-lg mr-4 rounded-full bg-gray-50 text-gray-500 shadow-inner">
                {index === 0 ? (
                  <Medal className="w-6 h-6 text-yellow-500" />
                ) : index === 1 ? (
                  <Medal className="w-6 h-6 text-gray-400" />
                ) : index === 2 ? (
                  <Medal className="w-6 h-6 text-amber-600" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="font-bold text-gray-800 truncate">{score.username}</div>
                <div className="text-xs text-gray-500">
                  {new Date(score.createdAt || '').toLocaleDateString()}
                </div>
              </div>
              
              <div className="font-black text-xl text-primary font-fredoka">
                {score.score}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
