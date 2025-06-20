// src/hooks/utils/postUtils.ts
import type { Post, Comment, NotificationReaction } from '../../types/post';

/**
 * Parsea fechas en posts
 */
export const parsePostDates = (post: any): Post => {
  return {
    ...post,
    createdAt: new Date(post.createdAt),
    reactions: post.reactions || {},
    userReaction: post.userReaction || null,
    comments: post.comments?.map((comment: any) => parseCommentDates(comment)) || []
  };
};

/**
 * Parsea fechas en comentarios
 */
export const parseCommentDates = (comment: any): Comment => {
  return {
    ...comment,
    createdAt: new Date(comment.createdAt),
    reactions: comment.reactions || {},
    userReaction: comment.userReaction || null,
    replies: comment.replies?.map((reply: any) => parseCommentDates(reply)) || []
  };
};

/**
 * ✅ ARREGLADO: Actualiza reacciones en comentarios recursivamente
 * FUERZA INMUTABILIDAD para que React detecte los cambios
 */
export const updateCommentReactionsRecursive = (
  comments: Comment[], 
  reactionNotification: NotificationReaction,
  userReaction?: string | null
): Comment[] => {
  return comments.map(comment => {
    if (comment.id === reactionNotification.targetId && reactionNotification.targetType === 'COMMENT') {
      console.log(`🔄 Actualizando comentario ${comment.id}:`, {
        conteoAntes: comment.reactions,
        conteoDespues: reactionNotification.reactionCounts,
        userReactionAntes: comment.userReaction,
        userReactionDespues: userReaction !== undefined ? userReaction : comment.userReaction
      });
      
      // ✅ CREAR NUEVO OBJETO COMPLETAMENTE - FORZAR INMUTABILIDAD
      const updatedComment = {
        ...comment,
        // ✅ CREAR NUEVO OBJETO para reactions (no reutilizar referencia)
        reactions: { ...reactionNotification.reactionCounts },
        // ✅ ACTUALIZAR userReaction
        userReaction: userReaction !== undefined ? userReaction : comment.userReaction,
        // ✅ CREAR NUEVO ARRAY para replies (mantener inmutabilidad)
        replies: comment.replies ? [...comment.replies] : []
      };
      
      console.log('✅ Comentario actualizado:', updatedComment);
      return updatedComment;
    }
    
    if (comment.replies && comment.replies.length > 0) {
      // ✅ CREAR NUEVO OBJETO para el comentario padre también
      return {
        ...comment,
        replies: updateCommentReactionsRecursive(comment.replies, reactionNotification, userReaction)
      };
    }
    
    return comment;
  });
};

/**
 * Agrega comentario a posts
 */
export const addCommentToPosts = (posts: Post[], newComment: Comment): Post[] => {
  return posts.map(post => {
    if ((newComment as any).postId === post.id) {
      return {
        ...post,
        comments: [...post.comments, newComment]
      };
    }
    return post;
  });
};