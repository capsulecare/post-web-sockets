package com.skill.websockets.controller;

import com.skill.websockets.dto.CommentDTO; // Asegúrate de que esta importación sea correcta
import com.skill.websockets.dto.ReactionNotificationDTO; // ¡NUEVA IMPORTACIÓN: Tu DTO de notificación de reacción!
import com.skill.websockets.model.TargetType; // Asegúrate de que esta importación sea correcta

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

@Controller
public class WebSocketMessageController {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public WebSocketMessageController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Notifica a los suscriptores sobre un nuevo comentario.
     * Este método es llamado desde CommentService.
     *
     * @param commentDTO El CommentDTO ya preparado para enviar al frontend.
     */
    public void notifyNewComment(CommentDTO commentDTO) {
        // El destino del mensaje es específico del post al que pertenece el comentario
        // El frontend se suscribirá a /topic/posts/{postId}/comments (o a /topic/comments/new si es global)
        // Revisar si tu frontend se suscribe a /topic/comments/new como en usePosts.ts
        // Si tu frontend se suscribe a '/topic/comments/new', entonces el destino debería ser ese:
        String destination = "/topic/comments/new"; // Revisa esto con la suscripción real de tu frontend
        messagingTemplate.convertAndSend(destination, commentDTO);
    }

    /**
     * Notifica a los suscriptores sobre un cambio en las reacciones de un post o comentario.
     * CAMBIO IMPORTANTE: Ya no enviamos userReaction específica, solo los conteos generales.
     * Cada cliente deberá consultar su propia reacción individualmente.
     *
     * @param targetId      El ID del post o comentario afectado (Long).
     * @param targetType    El tipo de objetivo (POST o COMMENT).
     * @param reactionCounts Un mapa con los conteos de cada tipo de reacción.
     */
    public void notifyReactionChange(Long targetId, TargetType targetType, Map<String, Long> reactionCounts) {
        // Definimos un tópico general para todas las notificaciones de reacciones.
        // Esto simplifica la suscripción en el frontend, que solo necesita escuchar un canal.
        String destination = "/topic/reactions/new"; // Tópico general

        // Creamos una instancia de nuestro DTO para enviar la notificación
        // CAMBIO: userReaction ahora siempre es null porque cada cliente debe consultar la suya
        ReactionNotificationDTO notification = new ReactionNotificationDTO(
                String.valueOf(targetId), // Convertimos Long a String, ya que el frontend espera String para IDs
                targetType,
                reactionCounts,
                null // ¡CAMBIO CLAVE! Ya no enviamos userReaction específica
        );

        // Enviamos el DTO al tópico general de reacciones
        messagingTemplate.convertAndSend(destination, notification);
    }

    // Los métodos notifyUpdatedReactionToPost y notifyNewReactionToComment/notifyUpdatedReactionToComment
    // que quizás tenías antes, se eliminan. notifyReactionChange ahora centraliza esta lógica.
}