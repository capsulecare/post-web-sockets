// src/hooks/reactions/useReactions.ts
import { useCallback } from 'react';
import { sendReaction } from '../api/postsApi';

// Mapeo directo - nombres exactos de la BD
const REACTION_TYPE_MAP: { [key: string]: number } = {
  "Me gusta": 1,  
  "Me encanta": 2,    
  "Celebrar": 3,     
  "Interesante": 4,    
  "De acuerdo": 5,    
  "Hacer gracias": 6, 
};

interface UseReactionsOptions {
  currentUserId: string | null;
}

export const useReactions = ({ currentUserId }: UseReactionsOptions) => {
  const handleReaction = useCallback(async (postId: string, reactionType: string) => {
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
      await sendReaction(currentUserId, postId, reactionType, reactionTypeId);
      console.log("Reacción enviada exitosamente!");
    } catch (error) {
      console.error("Error al enviar la reacción:", error);
    }
  }, [currentUserId]);

  return { handleReaction };
};