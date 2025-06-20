import React from 'react';
import { reactionConfig } from '../../constants/reactions';

interface ReactionStatsProps {
  reactions: Record<string, number>;
  commentsCount?: number;
}

const ReactionStats: React.FC<ReactionStatsProps> = ({ reactions, commentsCount = 0 }) => {
  const getTotalReactions = () => {
    return Object.values(reactions).reduce((sum, count) => sum + count, 0);
  };

  const totalReactions = getTotalReactions();

  if (totalReactions === 0 && commentsCount === 0) return null;

  return (
    <div className="px-6 py-2 border-t border-slate-100 bg-slate-50/50">
      <div className="flex items-center justify-between text-sm text-slate-600">
        {totalReactions > 0 && (
          <div className="flex items-center space-x-1">
            <div className="flex -space-x-1">
              {Object.entries(reactions)
                .filter(([_, count]) => count > 0)
                .slice(0, 3)
                .map(([reaction]) => (
                  <div key={reaction} className="w-5 h-5 flex items-center justify-center text-sm">
                    {reactionConfig[reaction as keyof typeof reactionConfig]?.emoji}
                  </div>
                ))}
            </div>
            <span>{totalReactions} reacciones</span>
          </div>
        )}
        
        {commentsCount > 0 && (
          <div className="flex items-center space-x-4">
            <span>{commentsCount} comentarios</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactionStats;