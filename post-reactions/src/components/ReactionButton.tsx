import React, { useState, useRef } from 'react';
import { ThumbsUp } from 'lucide-react';

interface ReactionButtonProps {
  currentReaction: string | null;
  reactions: Record<string, number>;
  onReaction: (reaction: string) => void;
}

const reactionConfig = {
  'Me gusta': { emoji: '👍', label: 'Me gusta', color: 'text-blue-600' },
  'Me encanta': { emoji: '😍', label: 'Me encanta', color: 'text-pink-600' },
  'Celebrar': { emoji: '🎉', label: 'Celebrar', color: 'text-yellow-600' },
  'Interesante': { emoji: '💡', label: 'Interesante', color: 'text-orange-600' },
  'De acuerdo': { emoji: '🤝', label: 'De acuerdo', color: 'text-green-600' },
  'Hacer gracias': { emoji: '😄', label: 'Hacer gracias', color: 'text-purple-600' }
};

const ReactionButton: React.FC<ReactionButtonProps> = ({ currentReaction, reactions, onReaction }) => {
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
            <button
              key={key}
              onClick={() => onReaction(key)}
              onMouseEnter={() => setHoveredReaction(key)}
              onMouseLeave={() => setHoveredReaction(null)}
              className={`p-2 rounded-xl hover:bg-slate-50 transition-all duration-200 flex flex-col items-center min-w-[60px] ${
                hoveredReaction === key ? 'transform scale-125' : ''
              }`}
              title={config.label}
            >
              <span className="text-2xl mb-1">{config.emoji}</span>
              <span className={`text-xs font-medium ${config.color}`}>
                {config.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={handleQuickReaction}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          currentReaction
            ? `${currentReactionConfig?.color} bg-blue-50 hover:bg-blue-100`
            : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        {currentReaction ? (
          <>
            <span className="text-lg">{currentReactionConfig?.emoji}</span>
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