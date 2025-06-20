import React, { useState } from 'react';
import type { Comment } from '../../types/post';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, postId }) => {
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

  return (
    <div className="border-t border-slate-100 bg-slate-50/30">
      {/* Comments List */}
      {commentsList.length > 0 && (
        <div className="px-6 py-4 space-y-4">
          {commentsList.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      {/* Comment Input */}
      <CommentForm onSubmit={handleNewComment} />
    </div>
  );
};

export default CommentSection;