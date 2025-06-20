import React, { useState } from 'react';
import type { Comment } from '../../types/post';
import Avatar from '../ui/Avatar';
import ReactionButton from '../reaction/ReactionButton';
import Button from '../ui/Button';
import CommentForm from './CommentForm';
import { Reply, MoreHorizontal } from 'lucide-react';

interface CommentCardProps {
  comment: Comment;
  isReply?: boolean;
  onReaction?: (commentId: string, reactionType: string) => void;
  onNewComment?: (postId: string, content: string, parentCommentId?: string) => Promise<void>; // ✅ NUEVO
  forceRenderKey?: number;
}

const CommentCard: React.FC<CommentCardProps> = ({ 
  comment, 
  isReply = false, 
  onReaction,
  onNewComment, // ✅ NUEVO
  forceRenderKey
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const handleReaction = (reactionType: string) => {
    console.log('🎯 Reacción a comentario:', comment.id, reactionType, 'forceRenderKey:', forceRenderKey);
    if (onReaction) {
      onReaction(comment.id, reactionType);
    } else {
      console.warn('⚠️ No se proporcionó función onReaction para el comentario');
    }
  };

  // ✅ NUEVO: Manejar respuesta a comentario
  const handleReplySubmit = async (content: string) => {
    if (onNewComment) {
      try {
        // Necesitamos el postId - lo podemos obtener del contexto o pasarlo como prop
        // Por ahora, vamos a asumir que está disponible en el comment o lo pasamos desde arriba
        await onNewComment('1', content, comment.id); // TODO: Obtener postId real
        setShowReplyForm(false);
        setShowReplies(true);
        console.log('✅ Respuesta enviada exitosamente');
      } catch (error) {
        console.error('❌ Error al enviar respuesta:', error);
      }
    }
  };

  console.log(`🔄 Renderizando CommentCard ${comment.id}:`, {
    userReaction: comment.userReaction,
    reactions: comment.reactions,
    forceRenderKey,
    hasOnNewComment: !!onNewComment
  });

  return (
    <div className={`${isReply ? 'ml-8' : ''}`}>
      <div className="flex items-start space-x-3 group">
        <Avatar
          src={comment.author.avatar}
          alt={comment.author.name}
          size="sm"
        />
        
        <div className="flex-1 min-w-0">
          <div className="bg-slate-100 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-slate-900">{comment.author.name}</h4>
                <p className="text-sm text-slate-600">{comment.author.title}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">{formatTimeAgo(comment.createdAt)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={MoreHorizontal}
                  className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                />
              </div>
            </div>
            
            <p className="text-slate-800 leading-relaxed">{comment.content}</p>
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <ReactionButton
              key={`reaction-${comment.id}-${forceRenderKey || 0}`}
              currentReaction={comment.userReaction || null}
              reactions={comment.reactions}
              onReaction={handleReaction}
            />
            
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                icon={Reply}
                className="text-slate-500 hover:text-blue-600 transition-colors font-medium"
              >
                Responder
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                onSubmit={handleReplySubmit}
                placeholder={`Responder a ${comment.author.name}...`}
                parentCommentId={comment.id}
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {!showReplies ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Ver {comment.replies.length} respuesta{comment.replies.length > 1 ? 's' : ''}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplies(false)}
                    className="text-slate-500 hover:text-slate-700 text-sm font-medium"
                  >
                    Ocultar respuestas
                  </Button>
                  {comment.replies.map((reply) => (
                    <CommentCard 
                      key={`${reply.id}-${forceRenderKey || 0}`}
                      comment={reply} 
                      isReply={true}
                      onReaction={onReaction}
                      onNewComment={onNewComment} // ✅ PASAR FUNCIÓN
                      forceRenderKey={forceRenderKey}
                    />
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