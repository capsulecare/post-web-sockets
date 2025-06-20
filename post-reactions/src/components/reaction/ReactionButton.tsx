import React, { useState, useRef } from 'react';
import { ThumbsUp } from 'lucide-react';
import { reactionConfig } from '../../constants/reactions';
import Tooltip from '../ui/Tooltip';

interface ReactionButtonProps {
  currentReaction: string | null;
  reactions: Record<string, number>;
  onReaction: (reaction: string) => void;
}

const ReactionButton: React.FC<ReactionButtonProps> = ({ 
  currentReaction, 
  reactions, 
  onReaction 
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovering(false);
      setHoveredReaction(null);
    }, 200);
  };

  const handleQuickReaction = () => {
    onReaction('Me gusta');
  };

  const getTotalReactions = () => {
    return Object.values(reactions).reduce((sum, count) => sum + count, 0);
  };

  const currentReactionConfig = currentReaction ? reactionConfig[currentReaction as keyof typeof reactionConfig] : null;

  return (
    <div className="relative">
      {/* Hover Menu */}
      {isHovering && (
        <div 
          className="absolute bottom-full left-0 mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 flex items-center space-x-1 z-50 animate-in slide-in-from-bottom-2 duration-200"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {Object.entries(reactionConfig).map(([key, config]) => (
            <Tooltip key={key} content={config.label} position="top">
              <button
                onClick={() => onReaction(key)}
                onMouseEnter={() => setHoveredReaction(key)}
                onMouseLeave={() => setHoveredReaction(null)}
                className={`p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 flex items-center justify-center min-w-[50px] min-h-[50px] cursor-pointer ${
                  hoveredReaction === key ? 'transform scale-125 bg-slate-50' : ''
                }`}
              >
                <span className="text-2xl select-none">{config.emoji}</span>
              </button>
            </Tooltip>
          ))}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={handleQuickReaction}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
          currentReaction
            ? `${currentReactionConfig?.color} bg-blue-50 hover:bg-blue-100`
            : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        {currentReaction ? (
          <>
            <span className="text-lg select-none">{currentReactionConfig?.emoji}</span>
            <span>{currentReactionConfig?.label}</span>
          </>
        ) : (
          <>
            <ThumbsUp className="w-5 h-5" />
            <span>Me gusta</span>
          </>
        )}
        
        {getTotalReactions() > 0 && (
          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-semibold">
            {getTotalReactions()}
          </span>
        )}
      </button>
    </div>
  );
};

export default ReactionButton;