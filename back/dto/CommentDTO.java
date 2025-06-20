// src/main/java/com/skill/websockets/dto/CommentDTO.java (CORREGIDO)
package com.skill.websockets.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

import com.skill.websockets.model.Comment; // Importa la entidad Comment

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
// Ya no necesitamos HashMap aquí porque no se inicializa en el constructor

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private String id;
    private UserDTO author; // Usamos el DTO del User para el autor
    private String content; // Mapea de 'contenido'
    private LocalDateTime createdAt; // Mapea de 'fechaComentario'

    // Estos campos serán llenados por CommentService, NO por el constructor del DTO
    private Map<String, Integer> reactions;
    private String userReaction;

    // IDs para las relaciones, esenciales para el frontend
    private String postId;
    @JsonInclude(JsonInclude.Include.NON_NULL) // Incluir solo si no es nulo (para comentarios padre)
    private String parentCommentId;

    @JsonInclude(JsonInclude.Include.NON_EMPTY) // Solo incluye si no está vacío
    private List<CommentDTO> replies; // Lista de respuestas (recursivo, llenado por CommentService)

    // Constructor que toma una entidad Comment y mapea SOLO sus propiedades directas.
    // Los conteos de reacciones y la lista de respuestas se añadirán en CommentService.
    public CommentDTO(Comment comment) {
        if (comment != null) {
            this.id = comment.getId() != null ? comment.getId().toString() : null;
            this.author = new UserDTO(comment.getUser()); // Asume que UserDTO(User) es seguro
            this.content = comment.getContenido();
            this.createdAt = comment.getFechaComentario();
            this.postId = comment.getPost() != null ? comment.getPost().getId().toString() : null;
            this.parentCommentId = comment.getParentComment() != null ? comment.getParentComment().getId().toString() : null;

            // 'reactions', 'userReaction', 'replies' se quedarán null en este punto.
            // Serán seteados por el CommentService.
        }
    }
}