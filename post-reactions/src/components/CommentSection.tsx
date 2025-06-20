import React, { useState } from 'react';
import type { Comment } from '../types/post';
import CommentCard from './CommentCard';
import { Send, Smile } from 'lucide-react';

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, postId }) => {
  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState(comments);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment: Comment = {
        id: `c${Date.now()}`,
        author: {
          id: 'current-user',
          name: 'Usuario Actual',
          avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=150',
          title: 'Emprendedor'
        },
        content: newComment,
        createdAt: new Date(),
        reactions: {},
        replies: []
      };
      
      setCommentsList([...commentsList, comment]);
      setNewComment('');
    }
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
      <div className="p-6 border-t border-slate-100">
        <form onSubmit={handleSubmitComment} className="flex items-start space-x-3">
          <img
            src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=150"
            alt="Tu avatar"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
          />
          
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-500 min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment(e);
                }
              }}
            />
            
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <Smile className="w-5 h-5" />
              </button>
              
              <button
                type="submit"
                disabled={!newComment.trim()}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  newComment.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Comentar</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentSection;