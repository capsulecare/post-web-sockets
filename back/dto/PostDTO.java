// src/main/java/com/skill/websockets/dto/PostDTO.java (OPTIMIZADO)
package com.skill.websockets.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

import com.skill.websockets.model.Post;
import com.skill.websockets.model.Tag;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private String id;
    private UserDTO author;
    private String content;
    private List<String> tags;
    private LocalDateTime createdAt;

    // ✅ OPTIMIZACIÓN 1: Solo incluir reacciones si hay alguna
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private Map<String, Integer> reactions;
    
    // ✅ OPTIMIZACIÓN 2: Solo incluir userReaction si existe
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String userReaction;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<CommentDTO> comments;

    public PostDTO(Post post) {
        if (post != null) {
            this.id = post.getId() != null ? post.getId().toString() : null;
            this.author = new UserDTO(post.getUser());
            this.content = post.getContenido();
            this.createdAt = post.getFechaPublicacion();

            if (post.getTags() != null && !post.getTags().isEmpty()) {
                this.tags = post.getTags().stream()
                        .map(Tag::getNombreEtiqueta)
                        .collect(Collectors.toList());
            } else {
                this.tags = List.of();
            }
        }
    }
}