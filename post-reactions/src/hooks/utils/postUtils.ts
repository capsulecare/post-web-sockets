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
 * Ahora actualiza TANTO conteos COMO userReaction en una sola pasada
 */
export const updateCommentReactionsRecursive = (
  comments: Comment[], 
  reactionNotification: NotificationReaction,
  userReaction?: string | null // ✅ NUEVO: Parámetro opcional para userReaction
): Comment[] => {
  return comments.map(comment => {
    if (comment.id === reactionNotification.targetId && reactionNotification.targetType === 'COMMENT') {
      console.log(`🔄 Actualizando comentario ${comment.id}:`, {
        conteoAntes: comment.reactions,
        conteoDespues: reactionNotification.reactionCounts,
        userReactionAntes: comment.userReaction,
        userReactionDespues: userReaction !== undefined ? userReaction : comment.userReaction
      });
      
      return {
        ...comment,
        reactions: reactionNotification.reactionCounts,
        // ✅ ACTUALIZAR userReaction si se proporciona, sino mantener la actual
        userReaction: userReaction !== undefined ? userReaction : comment.userReaction
      };
    }
    
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentReactionsRecursive(comment.replies, reactionNotification, userReaction)
      };
    }
    
    return comment;
  });
};

/**
 * ✅ SIMPLIFICADO: Función específica para actualizar solo userReaction
 * (Mantenida para compatibilidad, pero ya no es necesaria)
 */
export const updateCommentUserReaction = (
  comments: Comment[],
  targetId: string,
  userReaction: string | null
): Comment[] => {
  return comments.map(comment => {
    if (comment.id === targetId) {
      console.log(`🎯 Actualizando userReaction del comentario ${targetId}:`, {
        antes: comment.userReaction,
        despues: userReaction
      });
      
      return {
        ...comment,
        userReaction: userReaction
      };
    }
    
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentUserReaction(comment.replies, targetId, userReaction)
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