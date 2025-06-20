// src/main/java/com/skill/websockets/dto/PostDTO.java (CORREGIDO)
package com.skill.websockets.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

import com.skill.websockets.model.Post;
import com.skill.websockets.model.Tag; // Necesario para mapear las tags

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
    private List<String> tags; // Mapea de Set<Tag> a List<String>
    private LocalDateTime createdAt;

    // Estos campos serán llenados por PostService, NO por el constructor del DTO
    private Map<String, Integer> reactions;
    private String userReaction;

    @JsonInclude(JsonInclude.Include.NON_EMPTY) // Solo incluye si no está vacío
    private List<CommentDTO> comments;

    // Constructor que toma una entidad Post y mapea SOLO sus propiedades directas.
    // Los conteos de reacciones y la lista de comentarios se añadirán en PostService.
    public PostDTO(Post post) {
        if (post != null) {
            this.id = post.getId() != null ? post.getId().toString() : null;
            // El autor lo convertimos aquí, asumiendo que UserDTO(User) es suficiente
            this.author = new UserDTO(post.getUser());
            this.content = post.getContenido();
            this.createdAt = post.getFechaPublicacion();

            if (post.getTags() != null && !post.getTags().isEmpty()) {
                this.tags = post.getTags().stream()
                        .map(Tag::getNombreEtiqueta) // Usa getNombreEtiqueta() como en tus archivos
                        .collect(Collectors.toList());
            } else {
                this.tags = List.of(); // Lista inmutable vacía si no hay tags
            }
            // 'reactions', 'userReaction', 'comments' se quedarán null en este punto.
            // Serán seteados por el PostService.
        }
    }
}