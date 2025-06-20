// src/main/java/com/skill/websockets/model/Reaction.java (Ejemplo de cómo debería ser)
package com.skill.websockets.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "reacciones")
@Data
@NoArgsConstructor
@AllArgsConstructor // ESTE ES CRUCIAL PARA LA FORMA EN QUE LO CREO EN EL SERVICIO
public class Reaction {

    @EmbeddedId
    private ReactionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId") // Mapea el userId del ReactionId a la columna de la relación User
    @JoinColumn(name = "id_usuario", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_reaccion", nullable = false)
    private ReactionType reactionType;

    @Column(name = "fecha_reaccion", nullable = false)
    private LocalDateTime fechaReaccion;

    // Clase para la clave primaria compuesta
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReactionId implements Serializable {
        private Long userId;
        private Long targetId;
        @Enumerated(EnumType.STRING)
        private TargetType targetType;
    }
}