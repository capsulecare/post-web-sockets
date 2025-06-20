import React, { useState } from 'react';
import { MessageCircle, Share2, Bookmark } from 'lucide-react';
import ReactionButton from '../reaction/ReactionButton';
import Button from '../ui/Button';

interface PostActionsProps {
  reactions: Record<string, number>;
  userReaction: string | null;
  onReaction: (reaction: string) => void;
  onToggleComments: () => void;
  showComments: boolean;
}

const PostActions: React.FC<PostActionsProps> = ({
  reactions,
  userReaction,
  onReaction,
  onToggleComments,
  showComments
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <ReactionButton
          currentReaction={userReaction}
          reactions={reactions}
          onReaction={onReaction}
        />
        
        <Button
          variant="ghost"
          onClick={onToggleComments}
          icon={MessageCircle}
          className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
        >
          Comentar
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          icon={Share2}
          className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2"
        />
        <Button
          variant="ghost"
          size="sm"
          icon={Bookmark}
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`p-2 ${
            isBookmarked 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
        />
      </div>
    </div>
  );
};

export default PostActions;