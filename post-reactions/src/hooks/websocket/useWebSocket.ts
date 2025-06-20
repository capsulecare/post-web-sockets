// src/hooks/websocket/useWebSocket.ts
import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import type { Comment, NotificationReaction } from '../../types/post';

interface UseWebSocketOptions {
  onNewComment: (comment: Comment) => void;
  onReactionChange: (notification: NotificationReaction) => void;
}

export const useWebSocket = ({ onNewComment, onReactionChange }: UseWebSocketOptions) => {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new WebSocket('ws://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('WebSocket Conectado!');

        // Suscripción a comentarios
        client.subscribe('/topic/comments/new', message => {
          console.log('Nueva notificación de comentario RAW:', message.body);
          try {
            const newComment: Comment = JSON.parse(message.body);
            onNewComment(newComment);
          } catch (e) {
            console.error('Error parseando notificación de comentario:', e, message.body);
          }
        });

        // Suscripción a reacciones
        client.subscribe('/topic/reactions/new', message => {
          console.log('Nueva notificación de reacción RAW:', message.body);
          try {
            const reactionNotification: NotificationReaction = JSON.parse(message.body);
            console.log('Notificación de reacción PARSEADA:', reactionNotification);
            onReactionChange(reactionNotification);
          } catch (e) {
            console.error('ERROR al procesar notificación de reacción del WebSocket:', e, 'Mensaje recibido:', message.body);
          }
        });
      },

      onStompError: (frame) => {
        console.error('Error STOMP:', frame);
      },
      onDisconnect: () => {
        console.log('WebSocket Desconectado.');
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.connected) {
        client.deactivate();
        console.log('Desactivando conexión WebSocket.');
      }
    };
  }, [onNewComment, onReactionChange]);

  return clientRef.current;
};