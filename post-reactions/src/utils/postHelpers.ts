// src/utils/postHelpers.ts
import type { Post, Comment, NotificationReaction } from '../types/post';

/**
 * Helper function to convert backend DTO dates (string) to Date objects
 * This is crucial because `LocalDateTime` from Spring Boot is serialized as a String.
 * @param post The post object received from the backend (could have string dates).
 * @returns The post object with `Date` objects for `createdAt`.
 */
export const parsePostDates = (post: any): Post => ({
  ...post,
  createdAt: new Date(post.createdAt),
  comments: post.comments?.map((comment: any) => parseCommentDates(comment)) || [],
});

/**
 * Helper function to parse comment dates recursively.
 * @param comment The comment object received from the backend (could have string dates).
 * @returns The comment object with `Date` objects for `createdAt`.
 */
export const parseCommentDates = (comment: any): Comment => ({
  ...comment,
  createdAt: new Date(comment.createdAt),
  // Ensure default avatar is applied if null/undefined
  author: { ...comment.author, avatar: comment.author.avatar || 'https://default-avatar.url/path' },
  replies: comment.replies?.map((reply: any) => parseCommentDates(reply)) || [],
});

/**
 * Recursively updates reaction counts for comments and their replies.
 * This function handles both top-level comments and nested replies.
 * @param comments An array of comments to process.
 * @param notification The new reaction notification (ahora es NotificationReaction con conteos).
 * @returns A new array of comments with updated reaction counts.
 */
export const updateCommentReactionsRecursive = (
  comments: Comment[],
  notification: NotificationReaction // ¡AQUÍ ESTÁ EL CAMBIO CLAVE! Ahora espera el NotificationReaction completo
): Comment[] => {
  return comments.map(comment => {
    // Si la notificación es para este comentario específico
    // Comparamos el targetType y el ID del comentario con el targetId de la notificación
    if (notification.targetType === 'COMMENT' && comment.id === notification.targetId) {
      // Actualizamos las reacciones y la userReaction directamente con lo que viene en la notificación
      return {
        ...comment,
        reactions: notification.reactionCounts, // Usa el mapa de conteos completo
        userReaction: notification.userReaction // Usa la reacción del usuario actual (puede ser null)
      };
    }

    // Si el comentario tiene respuestas, recursivamente verificarlas
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentReactionsRecursive(comment.replies, notification) // Pasa la notificación completa
      };
    }

    return comment;
  });
};

/**
 * Adds a new comment or reply to the correct position within the posts structure.
 * Handles both top-level comments and nested replies.
 * @param prevPosts The previous state of posts.
 * @param newComment The new comment or reply to add.
 * @returns A new array of posts with the added comment/reply.
 */
export const addCommentToPosts = (
  prevPosts: Post[],
  newComment: Comment
): Post[] => {
  return prevPosts.map(post => {
    // If the comment is for this post
    if (post.id === newComment.postId) {
      const updatedComments = [...post.comments];

      // Recursive function to add the reply to its parent comment
      const addReplyRecursive = (comments: Comment[], reply: Comment): Comment[] => {
        return comments.map(c => {
          if (c.id === reply.parentCommentId) {
            // Found the parent, add the reply
            const updatedReplies = c.replies ? [...c.replies] : [];
            // Basic deduplication for StrictMode in dev (to prevent duplicates on re-render)
            if (!updatedReplies.some(r => r.id === reply.id)) {
              updatedReplies.push({
                ...reply,
                createdAt: new Date(reply.createdAt),
                author: { ...reply.author, avatar: reply.author.avatar || 'https://default-avatar.url/path' }
              });
            }
            return { ...c, replies: updatedReplies };
          } else if (c.replies && c.replies.length > 0) {
            // Recursively search in nested replies
            return { ...c, replies: addReplyRecursive(c.replies, reply) };
          }
          return c;
        });
      };

      if (newComment.parentCommentId) {
        // It's a reply, add it to its parent comment
        return { ...post, comments: addReplyRecursive(updatedComments, newComment) };
      } else {
        // It's a top-level comment
        // Basic deduplication for StrictMode in dev
        if (!updatedComments.some(c => c.id === newComment.id)) {
          updatedComments.push({
            ...newComment,
            createdAt: new Date(newComment.createdAt), // Convert to Date
            author: { ...newComment.author, avatar: newComment.author.avatar || 'https://default-avatar.url/path' }
          });
        }
        return { ...post, comments: updatedComments };
      }
    }
    return post;
  });
};