import React, { useState } from 'react';
import type { Comment } from '../types/post';
import ReactionButton from './ReactionButton';
import { Reply, MoreHorizontal } from 'lucide-react';

interface CommentCardProps {
  comment: Comment;
  isReply?: boolean;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment, isReply = false }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [replies, setReplies] = useState(comment.replies || []);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const handleReaction = (reactionType: string) => {
    // Implementar lógica de reacción a comentario
    console.log('Reacción a comentario:', comment.id, reactionType);
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReply.trim()) {
      const reply: Comment = {
        id: `r${Date.now()}`,
        author: {
          id: 'current-user',
          name: 'Usuario Actual',
          avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=150',
          title: 'Emprendedor'
        },
        content: newReply,
        createdAt: new Date(),
        reactions: {},
        replies: []
      };
      
      setReplies([...replies, reply]);
      setNewReply('');
      setShowReplyForm(false);
      setShowReplies(true);
    }
  };

  const getTotalReactions = () => {
    return Object.values(comment.reactions).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className={`${isReply ? 'ml-8' : ''}`}>
      <div className="flex items-start space-x-3">
        <img
          src={comment.author.avatar}
          alt={comment.author.name}
          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="bg-slate-100 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-sm text-slate-900">{comment.author.name}</h4>
              <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-slate-600 mb-1">{comment.author.title}</p>
            <p className="text-slate-800 leading-relaxed">{comment.content}</p>
          </div>

          <div className="flex items-center space-x-4 mt-2 text-sm">
            <span className="text-slate-500">{formatTimeAgo(comment.createdAt)}</span>
            
            {getTotalReactions() > 0 && (
              <span className="text-slate-500">{getTotalReactions()} reacciones</span>
            )}

            <div className="flex items-center space-x-2">
              <ReactionButton
                currentReaction={null}
                reactions={comment.reactions}
                onReaction={handleReaction}
              />
              
              {!isReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center space-x-1 text-slate-500 hover:text-blue-600 transition-colors font-medium"
                >
                  <Reply className="w-4 h-4" />
                  <span>Responder</span>
                </button>
              )}
            </div>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <form onSubmit={handleSubmitReply} className="mt-3 flex items-center space-x-3">
              <img
                src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=150"
                alt="Tu avatar"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder={`Responder a ${comment.author.name}...`}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!newReply.trim()}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  newReply.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Responder
              </button>
            </form>
          )}

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-3">
              {!showReplies ? (
                <button
                  onClick={() => setShowReplies(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  Ver {replies.length} respuesta{replies.length > 1 ? 's' : ''}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowReplies(false)}
                    className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
                  >
                    Ocultar respuestas
                  </button>
                  {replies.map((reply) => (
                    <CommentCard key={reply.id} comment={reply} isReply={true} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;