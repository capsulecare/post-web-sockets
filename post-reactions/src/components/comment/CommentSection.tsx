import React, { useState } from 'react';
import type { Comment } from '../../types/post';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
  onCommentReaction?: (commentId: string, reactionType: string) => void;
  // ✅ NUEVO: Key para forzar re-render
  forceRenderKey?: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ 
  comments, 
  postId, 
  onCommentReaction,
  forceRenderKey // ✅ NUEVO
}) => {
  const [commentsList, setCommentsList] = useState(comments);

  const handleNewComment = (content: string) => {
    const comment: Comment = {
      id: `c${Date.now()}`,
      author: {
        id: 'current-user',
        name: 'Usuario Actual',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=150',
        title: 'Emprendedor'
      },
      content,
      createdAt: new Date(),
      reactions: {},
      replies: []
    };
    
    setCommentsList([...commentsList, comment]);
  };

  // ✅ NUEVO: Log para debug
  console.log(`🔄 Renderizando CommentSection para post ${postId}:`, {
    commentsCount: comments.length,
    forceRenderKey
  });

  return (
    <div className="border-t border-slate-100 bg-slate-50/30">
      {/* Comments List */}
      {comments.length > 0 && (
        <div className="px-6 py-4 space-y-4">
          {comments.map((comment) => (
            <CommentCard 
              key={`${comment.id}-${forceRenderKey || 0}`} // ✅ KEY ÚNICA
              comment={comment}
              onReaction={onCommentReaction}
              forceRenderKey={forceRenderKey} // ✅ PASAR LA KEY
            />
          ))}
        </div>
      )}

      {/* Comment Input */}
      <CommentForm onSubmit={handleNewComment} />
    </div>
  );
};

export default CommentSection;