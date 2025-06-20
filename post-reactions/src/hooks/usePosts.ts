import { useState, useEffect, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import type { Post, Comment, NotificationReaction } from '../types/post';

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

// Mapeo directo - nombres exactos de la BD
const REACTION_TYPE_MAP: { [key: string]: number } = {
  "Me gusta": 1,  
  "Me encanta": 2,    
  "Celebrar": 3,     
  "Interesante": 4,    
  "De acuerdo": 5,    
  "Hacer gracias": 6, 
};

// Función para parsear fechas en posts
const parsePostDates = (post: any): Post => {
  return {
    ...post,
    createdAt: new Date(post.createdAt),
    reactions: post.reactions || {},
    userReaction: post.userReaction || null,
    comments: post.comments?.map((comment: any) => parseCommentDates(comment)) || []
  };
};

// Función para parsear fechas en comentarios
const parseCommentDates = (comment: any): Comment => {
  return {
    ...comment,
    createdAt: new Date(comment.createdAt),
    reactions: comment.reactions || {},
    userReaction: comment.userReaction || null,
    replies: comment.replies?.map((reply: any) => parseCommentDates(reply)) || []
  };
};

// Función para actualizar reacciones en comentarios recursivamente
const updateCommentReactionsRecursive = (
  comments: Comment[], 
  reactionNotification: NotificationReaction
): Comment[] => {
  return comments.map(comment => {
    if (comment.id === reactionNotification.targetId && reactionNotification.targetType === 'COMMENT') {
      return {
        ...comment,
        reactions: reactionNotification.reactionCounts,
        // CAMBIO: Ya no actualizamos userReaction desde WebSocket, se mantiene el valor actual
        // userReaction: reactionNotification.userReaction // ← REMOVIDO
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

// Función para agregar comentario a posts
const addCommentToPosts = (posts: Post[], newComment: Comment): Post[] => {
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

// NUEVA FUNCIÓN: Consultar la reacción del usuario actual para un target específico
const fetchUserReaction = async (currentUserId: string, targetId: string, targetType: 'POST' | 'COMMENT'): Promise<string | null> => {
  try {
    const response = await fetch(`http://localhost:8080/api/reactions/user-reaction?userId=${currentUserId}&targetId=${targetId}&targetType=${targetType}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Usuario no ha reaccionado
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const userReaction = await response.text();
    return userReaction || null;
  } catch (error) {
    console.error('Error fetching user reaction:', error);
    return null;
  }
};

export const usePosts = ({ currentUserId }: UsePostsOptions): UsePostsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userIdParam = currentUserId ? `?currentUserId=${currentUserId}` : '';
      const response = await fetch(`http://localhost:8080/api/posts${userIdParam}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: any[] = await response.json();
      
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

  useEffect(() => {
    fetchPosts();

    const client = new Client({
      webSocketFactory: () => new WebSocket('ws://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('WebSocket Conectado en usePosts!');

        client.subscribe('/topic/comments/new', message => {
          console.log('Nueva notificación de comentario RAW:', message.body);
          try {
            const newComment: Comment = parseCommentDates(JSON.parse(message.body));
            setPosts(prevPosts => addCommentToPosts(prevPosts, newComment));
          } catch (e) {
            console.error('Error parseando notificación de comentario:', e, message.body);
          }
        });

        client.subscribe('/topic/reactions/new', message => {
          console.log('Nueva notificación de reacción RAW:', message.body);
          try {
            const reactionNotification: NotificationReaction = JSON.parse(message.body);
            console.log('Notificación de reacción PARSEADA:', reactionNotification);

            // CAMBIO CLAVE: Primero actualizamos los conteos de manera síncrona
            setPosts((prevPosts: Post[]) => {
              return prevPosts.map((post: Post) => {
                if (reactionNotification.targetType === 'POST' && post.id === reactionNotification.targetId) {
                  console.log('Actualizando reacciones del post:', post.id);
                  console.log('Reacciones antes:', post.reactions);
                  console.log('Nuevas reacciones del backend:', reactionNotification.reactionCounts);
                  
                  return {
                    ...post,
                    reactions: reactionNotification.reactionCounts,
                    // Mantenemos la userReaction actual por ahora
                    userReaction: post.userReaction
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

            // NUEVO: Luego consultamos la reacción del usuario actual de manera asíncrona
            if (reactionNotification.targetType === 'POST' && currentUserId) {
              fetchUserReaction(currentUserId, reactionNotification.targetId, 'POST')
                .then(userReaction => {
                  console.log('UserReaction consultada individualmente:', userReaction);
                  
                  setPosts((prevPosts: Post[]) => {
                    return prevPosts.map((post: Post) => {
                      if (post.id === reactionNotification.targetId) {
                        return {
                          ...post,
                          userReaction: userReaction
                        };
                      }
                      return post;
                    });
                  });
                })
                .catch(error => {
                  console.error('Error consultando userReaction:', error);
                });
            }

            // NUEVO: Manejar comentarios de manera similar si es necesario
            if (reactionNotification.targetType === 'COMMENT' && currentUserId) {
              fetchUserReaction(currentUserId, reactionNotification.targetId, 'COMMENT')
                .then(userReaction => {
                  console.log('UserReaction de comentario consultada individualmente:', userReaction);
                  
                  // Función recursiva para actualizar la userReaction del comentario específico
                  const updateCommentUserReaction = (comments: Comment[]): Comment[] => {
                    return comments.map(comment => {
                      if (comment.id === reactionNotification.targetId) {
                        return {
                          ...comment,
                          userReaction: userReaction
                        };
                      }
                      
                      if (comment.replies && comment.replies.length > 0) {
                        return {
                          ...comment,
                          replies: updateCommentUserReaction(comment.replies)
                        };
                      }
                      
                      return comment;
                    });
                  };

                  setPosts((prevPosts: Post[]) => {
                    return prevPosts.map((post: Post) => {
                      return {
                        ...post,
                        comments: updateCommentUserReaction(post.comments)
                      };
                    });
                  });
                })
                .catch(error => {
                  console.error('Error consultando userReaction del comentario:', error);
                });
            }

          } catch (e) {
            console.error('ERROR al procesar notificación de reacción del WebSocket:', e, 'Mensaje recibido:', message.body);
          }
        });
      },

      onStompError: (frame) => {
        console.error('Error STOMP en usePosts:', frame);
      },
      onDisconnect: () => {
        console.log('WebSocket Desconectado de usePosts.');
      },
      debug: (str) => {
        console.log('STOMP Debug (usePosts):', str);
      },
    });

    client.activate();

    return () => {
      if (client.connected) {
        client.deactivate();
        console.log('Desactivando conexión WebSocket de usePosts.');
      }
    };
  }, [fetchPosts, currentUserId]);

  const handleReaction = async (postId: string, reactionType: string) => {
    const reactionTypeId = REACTION_TYPE_MAP[reactionType];

    if (!currentUserId) {
      console.warn("No currentUserId disponible. Por favor, inicia sesión para reaccionar.");
      return;
    }
    if (!reactionTypeId) {
      console.error(`Tipo de reacción inválido: ${reactionType}. No se encontró ID correspondiente.`);
      console.error('Tipos válidos:', Object.keys(REACTION_TYPE_MAP));
      return;
    }

    console.log(`Enviando reacción: ${reactionType} (ID: ${reactionTypeId}) para post ${postId} con usuario ${currentUserId}`);

    try {
      const response = await fetch(`http://localhost:8080/api/reactions?userId=${currentUserId}&targetId=${postId}&targetType=POST&reactionTypeId=${reactionTypeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 409) {
          console.warn("El usuario ya reaccionó con este tipo a este post. La lógica de 'toggle' ya está en el backend.");
        } else {
          const errorText = await response.text();
          console.error('Error del servidor:', errorText);
          throw new Error(`Fallo al enviar la reacción: ${response.status} ${response.statusText} - ${errorText}`);
        }
      } else {
        console.log("Reacción enviada exitosamente!");
      }
    } catch (error) {
      console.error("Error al enviar la reacción:", error);
    }
  };

  return { posts, loading, error, fetchPosts, handleReaction };
};