// src/hooks/usePosts.ts - Versión ARREGLADA con comentarios
import { useState, useEffect, useCallback } from 'react';
import type { Post, Comment, NotificationReaction } from '../types/post';

// Importaciones de módulos especializados
import { fetchPosts, fetchUserReaction, createComment } from './api/postsApi';
import { useWebSocket } from './websocket/useWebSocket';
import { useReactions } from './reactions/useReactions';
import { 
  parsePostDates, 
  updateCommentReactionsRecursive, 
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
  handleNewComment: (postId: string, content: string, parentCommentId?: string) => Promise<void>; // ✅ NUEVO
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

  // ✅ NUEVO: Función para crear comentarios
  const handleNewComment = useCallback(async (
    postId: string, 
    content: string, 
    parentCommentId?: string
  ) => {
    if (!currentUserId) {
      console.warn('No hay usuario logueado para crear comentario');
      throw new Error('Debes estar logueado para comentar');
    }

    try {
      console.log('🚀 Creando comentario:', { postId, content, parentCommentId, currentUserId });
      
      const newCommentDTO = await createComment(content, postId, currentUserId, parentCommentId);
      
      console.log('✅ Comentario creado, DTO recibido:', newCommentDTO);
      
      // El comentario se agregará automáticamente vía WebSocket
      // Pero podemos agregarlo localmente también para respuesta inmediata
      const newComment: Comment = {
        id: newCommentDTO.id,
        author: newCommentDTO.author,
        content: newCommentDTO.content,
        createdAt: new Date(newCommentDTO.createdAt),
        reactions: newCommentDTO.reactions || {},
        userReaction: newCommentDTO.userReaction || null,
        replies: newCommentDTO.replies || []
      };

      // Agregar el comentario localmente para respuesta inmediata
      setPosts(prevPosts => {
        return prevPosts.map(post => {
          if (post.id === postId) {
            if (parentCommentId) {
              // Es una respuesta - agregar a las replies del comentario padre
              const updateRepliesRecursive = (comments: Comment[]): Comment[] => {
                return comments.map(comment => {
                  if (comment.id === parentCommentId) {
                    return {
                      ...comment,
                      replies: [...(comment.replies || []), newComment]
                    };
                  } else if (comment.replies && comment.replies.length > 0) {
                    return {
                      ...comment,
                      replies: updateRepliesRecursive(comment.replies)
                    };
                  }
                  return comment;
                });
              };
              
              return {
                ...post,
                comments: updateRepliesRecursive(post.comments)
              };
            } else {
              // Es un comentario de nivel superior
              return {
                ...post,
                comments: [...post.comments, newComment]
              };
            }
          }
          return post;
        });
      });

    } catch (error) {
      console.error('❌ Error al crear comentario:', error);
      throw error;
    }
  }, [currentUserId]);

  // Manejador para nuevos comentarios desde WebSocket
  const handleNewCommentFromWS = useCallback((newComment: Comment) => {
    console.log('📡 Nuevo comentario recibido vía WebSocket:', newComment);
    setPosts(prevPosts => addCommentToPosts(prevPosts, newComment));
  }, []);

  // Manejador para cambios de reacciones
  const handleReactionChange = useCallback(async (reactionNotification: NotificationReaction) => {
    console.log('🔄 Procesando notificación de reacción:', reactionNotification);

    if (reactionNotification.targetType === 'POST') {
      // Manejar reacciones de posts
      let userReaction: string | null = null;
      
      if (currentUserId) {
        try {
          userReaction = await fetchUserReaction(currentUserId, reactionNotification.targetId, 'POST');
          console.log('👤 UserReaction de POST consultada:', userReaction);
        } catch (error) {
          console.error('❌ Error consultando userReaction de POST:', error);
        }
      }

      setPosts((prevPosts: Post[]) => {
        return prevPosts.map((post: Post) => {
          if (post.id === reactionNotification.targetId) {
            console.log('📝 Actualizando reacciones del post:', post.id);
            
            return {
              ...post,
              reactions: { ...reactionNotification.reactionCounts },
              userReaction: userReaction
            };
          }
          return post;
        });
      });

    } else if (reactionNotification.targetType === 'COMMENT') {
      // Manejar reacciones de comentarios
      let userReaction: string | null = null;
      
      if (currentUserId) {
        try {
          userReaction = await fetchUserReaction(currentUserId, reactionNotification.targetId, 'COMMENT');
          console.log('💬 UserReaction de COMMENT consultada:', userReaction);
        } catch (error) {
          console.error('❌ Error consultando userReaction del comentario:', error);
        }
      }

      setPosts((prevPosts: Post[]) => {
        const timestamp = Date.now();
        console.log(`🔄 Forzando actualización de comentarios - Timestamp: ${timestamp}`);
        
        return prevPosts.map((post: Post) => {
          const updatedPost = {
            ...post,
            comments: updateCommentReactionsRecursive(
              post.comments,
              reactionNotification,
              userReaction
            ),
            _lastUpdate: timestamp
          };
          
          return updatedPost;
        });
      });
    }
  }, [currentUserId]);

  // Configurar WebSocket
  useWebSocket({
    onNewComment: handleNewCommentFromWS,
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
    handleCommentReaction,
    handleNewComment // ✅ NUEVO: Exportar la función
  };
};