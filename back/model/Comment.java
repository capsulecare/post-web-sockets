// src/main/java/com/skill/websockets/model/Comment.java (VERSIÓN FINAL Y CORRECTA SEGÚN TU INTENCIÓN)
package com.skill.websockets.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonIgnore; // <-- MANTENEMOS ESTA IMPORTACIÓN

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "comentarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
// Mantenemos exclusiones para evitar StackOverflowError en equals/hashCode/toString
@EqualsAndHashCode(exclude = {"post", "user", "parentComment", "replies"})
@ToString(exclude = {"post", "user", "parentComment", "replies"})
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    @JsonIgnore // <-- MANTENEMOS ESTA ANOTACIÓN
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_post", nullable = false)
    @JsonIgnore // <-- MANTENEMOS ESTA ANOTACIÓN
    private Post post;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_comentario_padre")
    @JsonIgnore // <-- MANTENEMOS ESTA ANOTACIÓN
    private Comment parentComment;

    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // <-- MANTENEMOS ESTA ANOTACIÓN
    private Set<Comment> replies = new HashSet<>();

    @Column(name = "fecha_comentario", nullable = false)
    private LocalDateTime fechaComentario;

    @Column(name = "ultima_actualizacion")
    private LocalDateTime ultimaActualizacion;

    // *** IMPORTANTE: NO AGREGAMOS EL Set<Reaction> reactions AQUÍ ***
    // La lógica de reacciones se manejará en el DTO o en el servicio.

    public void addReply(Comment reply) {
        this.replies.add(reply);
        reply.setParentComment(this);
    }

    public void removeReply(Comment reply) {
        this.replies.remove(reply);
        reply.setParentComment(null);
    }
}