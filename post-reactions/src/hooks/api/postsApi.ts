// src/hooks/api/postsApi.ts
import type { Post } from '../../types/post';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Obtiene todos los posts desde el backend
 */
export const fetchPosts = async (currentUserId: string | null): Promise<Post[]> => {
  const userIdParam = currentUserId ? `?currentUserId=${currentUserId}` : '';
  const response = await fetch(`${API_BASE_URL}/posts${userIdParam}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Envía una reacción al backend
 */
export const sendReaction = async (
  currentUserId: string,
  postId: string,
  reactionType: string,
  reactionTypeId: number
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/reactions?userId=${currentUserId}&targetId=${postId}&targetType=POST&reactionTypeId=${reactionTypeId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok && response.status !== 409) {
    const errorText = await response.text();
    throw new Error(`Fallo al enviar la reacción: ${response.status} ${response.statusText} - ${errorText}`);
  }
};

/**
 * Consulta la reacción del usuario actual para un target específico
 */
export const fetchUserReaction = async (
  currentUserId: string,
  targetId: string,
  targetType: 'POST' | 'COMMENT'
): Promise<string | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reactions/user-reaction?userId=${currentUserId}&targetId=${targetId}&targetType=${targetType}`
    );
    
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