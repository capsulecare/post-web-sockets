// src/main/java/com/skill/websockets/dto/CommentDTO.java (OPTIMIZADO)
package com.skill.websockets.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

import com.skill.websockets.model.Comment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private String id;
    private UserDTO author;
    private String content;
    private LocalDateTime createdAt;

    // ✅ OPTIMIZACIÓN 1: Solo incluir reacciones si hay alguna (no enviar conteos en 0)
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private Map<String, Integer> reactions;
    
    // ✅ OPTIMIZACIÓN 2: Solo incluir userReaction si existe
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String userReaction;

    // ✅ OPTIMIZACIÓN 3: Eliminar postId (redundante, ya sabemos el post)
    // private String postId; // ❌ ELIMINADO

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String parentCommentId;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<CommentDTO> replies;

    public CommentDTO(Comment comment) {
        if (comment != null) {
            this.id = comment.getId() != null ? comment.getId().toString() : null;
            this.author = new UserDTO(comment.getUser());
            this.content = comment.getContenido();
            this.createdAt = comment.getFechaComentario();
            this.parentCommentId = comment.getParentComment() != null ? comment.getParentComment().getId().toString() : null;
        }
    }
}