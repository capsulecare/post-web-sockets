// src/hooks/usePosts.ts - Versión modularizada
import { useState, useEffect, useCallback } from 'react';
import type { Post, Comment, NotificationReaction } from '../types/post';

// Importaciones de módulos especializados
import { fetchPosts, fetchUserReaction } from './api/postsApi';
import { useWebSocket } from './websocket/useWebSocket';
import { useReactions } from './reactions/useReactions';
import { 
  parsePostDates, 
  updateCommentReactionsRecursive, 
  updateCommentUserReaction,
  addCommentToPosts 
} from './utils/postUtils';

interface UsePostsOptions {
  currentUserId: string | null;
}

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  handleReaction: (postId: string, reactionType: string) => Promise<void>;
}

export const usePosts = ({ currentUserId }: UsePostsOptions): UsePostsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hook para manejar reacciones
  const { handleReaction } = useReactions({ currentUserId });

  // Función para cargar posts
  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPosts(currentUserId);
      console.log('Datos RAW del backend:', data);
      
      const normalizedPosts: Post[] = data.map(parsePostDates);
      console.log('Posts normalizados:', normalizedPosts);
      
      setPosts(normalizedPosts);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError("No se pudieron cargar los posts. Intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Manejador para nuevos comentarios
  const handleNewComment = useCallback((newComment: Comment) => {
    console.log('Nuevo comentario recibido:', newComment);
    setPosts(prevPosts => addCommentToPosts(prevPosts, newComment));
  }, []);

  // Manejador para cambios de reacciones
  const handleReactionChange = useCallback((reactionNotification: NotificationReaction) => {
    console.log('Procesando notificación de reacción:', reactionNotification);

    // Paso 1: Actualizar conteos de manera síncrona
    setPosts((prevPosts: Post[]) => {
      return prevPosts.map((post: Post) => {
        if (reactionNotification.targetType === 'POST' && post.id === reactionNotification.targetId) {
          console.log('Actualizando reacciones del post:', post.id);
          console.log('Reacciones antes:', post.reactions);
          console.log('Nuevas reacciones del backend:', reactionNotification.reactionCounts);
          
          return {
            ...post,
            reactions: reactionNotification.reactionCounts,
            userReaction: post.userReaction // Mantenemos la userReaction actual
          };
        } else {
          const updatedComments = updateCommentReactionsRecursive(
            post.comments,
            reactionNotification
          );
          return { ...post, comments: updatedComments };
        }
      });
    });

    // Paso 2: Consultar userReaction del usuario actual de manera asíncrona
    if (currentUserId) {
      if (reactionNotification.targetType === 'POST') {
        fetchUserReaction(currentUserId, reactionNotification.targetId, 'POST')
          .then(userReaction => {
            console.log('UserReaction consultada individualmente:', userReaction);
            
            setPosts((prevPosts: Post[]) => {
              return prevPosts.map((post: Post) => {
                if (post.id === reactionNotification.targetId) {
                  return { ...post, userReaction: userReaction };
                }
                return post;
              });
            });
          })
          .catch(error => {
            console.error('Error consultando userReaction:', error);
          });
      } else if (reactionNotification.targetType === 'COMMENT') {
        fetchUserReaction(currentUserId, reactionNotification.targetId, 'COMMENT')
          .then(userReaction => {
            console.log('UserReaction de comentario consultada individualmente:', userReaction);
            
            setPosts((prevPosts: Post[]) => {
              return prevPosts.map((post: Post) => {
                return {
                  ...post,
                  comments: updateCommentUserReaction(
                    post.comments,
                    reactionNotification.targetId,
                    userReaction
                  )
                };
              });
            });
          })
          .catch(error => {
            console.error('Error consultando userReaction del comentario:', error);
          });
      }
    }
  }, [currentUserId]);

  // Configurar WebSocket
  useWebSocket({
    onNewComment: handleNewComment,
    onReactionChange: handleReactionChange
  });

  // Cargar posts al montar el componente
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return { 
    posts, 
    loading, 
    error, 
    fetchPosts: loadPosts, 
    handleReaction 
  };
};