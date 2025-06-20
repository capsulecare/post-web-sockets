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
 * Actualiza reacciones en comentarios recursivamente
 * ✅ ARREGLADO: Ahora mantiene la userReaction existente
 */
export const updateCommentReactionsRecursive = (
  comments: Comment[], 
  reactionNotification: NotificationReaction
): Comment[] => {
  return comments.map(comment => {
    if (comment.id === reactionNotification.targetId && reactionNotification.targetType === 'COMMENT') {
      console.log(`🔄 Actualizando conteos del comentario ${comment.id}:`, {
        antes: comment.reactions,
        despues: reactionNotification.reactionCounts,
        userReactionAntes: comment.userReaction
      });
      
      return {
        ...comment,
        reactions: reactionNotification.reactionCounts,
        // ✅ MANTENER la userReaction existente (se actualizará por separado)
        userReaction: comment.userReaction
      };
    }
    
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentReactionsRecursive(comment.replies, reactionNotification)
      };
    }
    
    return comment;
  });
};

/**
 * ✅ NUEVA FUNCIÓN: Actualiza la userReaction de un comentario específico recursivamente
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