package com.skill.websockets.dto;

import com.skill.websockets.model.TargetType; // Asegúrate de que esta importación sea correcta
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data // Genera getters, setters, toString, equals, hashCode
@NoArgsConstructor // Genera un constructor sin argumentos
@AllArgsConstructor // Genera un constructor con todos los argumentos
public class ReactionNotificationDTO {
    private String targetId; // ID del post o comentario afectado. String para flexibilidad en JS.
    private TargetType targetType; // Tipo de objetivo (POST o COMMENT)
    private Map<String, Long> reactionCounts; // Conteos de reacciones por tipo (ej. {"recomendar": 5, "apoyar": 2})
    private String userReaction; // El nombre del tipo de reacción del usuario actual (ej. "recomendar") o null si no ha reaccionado
}