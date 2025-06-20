// src/hooks/usePosts.ts - Versión corregida
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
  handleCommentReaction: (commentId: string, reactionType: string) => Promise<void>;
}

export const usePosts = ({ currentUserId }: UsePostsOptions): UsePostsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hook para manejar reacciones
  const { handlePostReaction, handleCommentReaction } = useReactions({ currentUserId });

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

  // ✅ ARREGLADO: Manejador para cambios de reacciones
  const handleReactionChange = useCallback((reactionNotification: NotificationReaction) => {
    console.log('🔄 Procesando notificación de reacción:', reactionNotification);

    // Paso 1: Actualizar conteos de manera síncrona
    setPosts((prevPosts: Post[]) => {
      return prevPosts.map((post: Post) => {
        if (reactionNotification.targetType === 'POST' && post.id === reactionNotification.targetId) {
          console.log('📝 Actualizando reacciones del post:', post.id);
          
          return {
            ...post,
            reactions: reactionNotification.reactionCounts,
            userReaction: post.userReaction // Mantener userReaction actual
          };
        } else if (reactionNotification.targetType === 'COMMENT') {
          // ✅ ARREGLADO: Solo actualizar conteos, no userReaction aún
          const updatedComments = updateCommentReactionsRecursive(
            post.comments,
            reactionNotification
          );
          return { ...post, comments: updatedComments };
        }
        return post;
      });
    });

    // Paso 2: Consultar y actualizar userReaction del usuario actual de manera asíncrona
    if (currentUserId) {
      if (reactionNotification.targetType === 'POST') {
        fetchUserReaction(currentUserId, reactionNotification.targetId, 'POST')
          .then(userReaction => {
            console.log('👤 UserReaction de POST consultada:', userReaction);
            
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
            console.error('❌ Error consultando userReaction de POST:', error);
          });
      } else if (reactionNotification.targetType === 'COMMENT') {
        // ✅ ARREGLADO: Consultar userReaction del comentario
        fetchUserReaction(currentUserId, reactionNotification.targetId, 'COMMENT')
          .then(userReaction => {
            console.log('💬 UserReaction de COMMENT consultada:', userReaction);
            
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
            console.error('❌ Error consultando userReaction del comentario:', error);
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
    handleReaction: handlePostReaction,
    handleCommentReaction
  };
};