package com.skill.websockets.controller;

import com.skill.websockets.model.Tag;
import com.skill.websockets.model.Post;
import com.skill.websockets.service.TagService;
import com.skill.websockets.dto.PostDTO;
import com.skill.websockets.service.PostService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;
    private final PostService postService;

    @Autowired
    public TagController(TagService tagService, PostService postService) {
        this.tagService = tagService;
        this.postService = postService;
    }

    /**
     * GET /api/tags - Obtiene todas las etiquetas disponibles
     */
    @GetMapping
    public ResponseEntity<List<Tag>> getAllTags() {
        List<Tag> tags = tagService.getAllTags();
        return ResponseEntity.ok(tags);
    }

    /**
     * GET /api/tags/{id} - Obtiene una etiqueta por su ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Tag> getTagById(@PathVariable Long id) {
        Optional<Tag> tag = tagService.getTagById(id);
        return tag.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/tags/search?name={name} - Busca una etiqueta por su nombre
     * MEJOR PRÁCTICA: Usar query parameter para búsquedas
     */
    @GetMapping("/search")
    public ResponseEntity<Tag> searchTagByName(@RequestParam String name) {
        Optional<Tag> tag = tagService.getTagByName(name);
        return tag.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/tags - Crea una nueva etiqueta
     * Body: { "nombreEtiqueta": "nueva-etiqueta" }
     */
    @PostMapping
    public ResponseEntity<Tag> createTag(@Valid @RequestBody CreateTagRequest request) {
        try {
            Tag createdTag = tagService.createTag(request.getNombreEtiqueta());
            return new ResponseEntity<>(createdTag, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * DELETE /api/tags/{id} - Elimina una etiqueta
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        try {
            tagService.deleteTag(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== ENDPOINTS PARA MANEJAR TAGS EN POSTS ==========

    /**
     * POST /api/posts/{postId}/tags - Agrega etiquetas a un post
     * MEJOR PRÁCTICA: Usar path anidado para recursos relacionados
     * Header: X-User-ID: 1 (opcional, mejor práctica para autenticación)
     * Body: { "tagNames": ["etiqueta1", "etiqueta2"] }
     */
    @PostMapping("/posts/{postId}/tags")
    public ResponseEntity<PostDTO> addTagsToPost(
            @PathVariable Long postId,
            @Valid @RequestBody TagsRequest request,
            @RequestHeader(value = "X-User-ID", required = false) Long currentUserId) {
        try {
            Post updatedPost = tagService.addTagsToPost(postId, request.getTagNames());
            
            PostDTO postDTO = postService.getPostById(updatedPost.getId(), currentUserId)
                    .orElseThrow(() -> new RuntimeException("Error al recuperar el PostDTO después de agregar etiquetas."));
            
            return ResponseEntity.ok(postDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * PUT /api/posts/{postId}/tags - Reemplaza todas las etiquetas de un post
     * MEJOR PRÁCTICA: PUT para reemplazar completamente el recurso
     */
    @PutMapping("/posts/{postId}/tags")
    public ResponseEntity<PostDTO> replacePostTags(
            @PathVariable Long postId,
            @Valid @RequestBody TagsRequest request,
            @RequestHeader(value = "X-User-ID", required = false) Long currentUserId) {
        try {
            Post updatedPost = tagService.setTagsToPost(postId, request.getTagNames());
            
            PostDTO postDTO = postService.getPostById(updatedPost.getId(), currentUserId)
                    .orElseThrow(() -> new RuntimeException("Error al recuperar el PostDTO después de actualizar etiquetas."));
            
            return ResponseEntity.ok(postDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * DELETE /api/posts/{postId}/tags - Remueve etiquetas específicas de un post
     * MEJOR PRÁCTICA: DELETE con body para especificar qué eliminar
     */
    @DeleteMapping("/posts/{postId}/tags")
    public ResponseEntity<PostDTO> removeTagsFromPost(
            @PathVariable Long postId,
            @Valid @RequestBody TagsRequest request,
            @RequestHeader(value = "X-User-ID", required = false) Long currentUserId) {
        try {
            Post updatedPost = tagService.removeTagsFromPost(postId, request.getTagNames());
            
            PostDTO postDTO = postService.getPostById(updatedPost.getId(), currentUserId)
                    .orElseThrow(() -> new RuntimeException("Error al recuperar el PostDTO después de remover etiquetas."));
            
            return ResponseEntity.ok(postDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/tags/{tagName}/posts - Obtiene posts por etiqueta
     * ALTERNATIVA: GET /api/posts?tag={tagName}&userId={userId}
     */
    @GetMapping("/{tagName}/posts")
    public ResponseEntity<List<PostDTO>> getPostsByTag(
            @PathVariable String tagName,
            @RequestParam(value = "userId", required = false) Long currentUserId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        try {
            List<Post> posts = tagService.getPostsByTag(tagName);
            
            // Aplicar paginación si es necesario
            List<PostDTO> postDTOs = posts.stream()
                    .skip((long) page * size)
                    .limit(size)
                    .map(post -> postService.getPostById(post.getId(), currentUserId))
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .toList();
            
            return ResponseEntity.ok(postDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== ENDPOINTS ALTERNATIVOS (MANTENEMOS COMPATIBILIDAD) ==========

    /**
     * DEPRECATED: Usar /api/posts/{postId}/tags en su lugar
     * Mantenemos para compatibilidad con frontend actual
     */
    @Deprecated
    @PostMapping("/add-to-post/{postId}")
    public ResponseEntity<PostDTO> addTagsToPostLegacy(
            @PathVariable Long postId,
            @RequestBody TagsRequest request,
            @RequestParam(value = "currentUserId", required = false) Long currentUserId) {
        return addTagsToPost(postId, request, currentUserId);
    }

    // ========== DTOs CON VALIDACIÓN ==========

    public static class CreateTagRequest {
        @NotNull(message = "El nombre de la etiqueta es obligatorio")
        @NotEmpty(message = "El nombre de la etiqueta no puede estar vacío")
        private String nombreEtiqueta;

        public String getNombreEtiqueta() {
            return nombreEtiqueta;
        }

        public void setNombreEtiqueta(String nombreEtiqueta) {
            this.nombreEtiqueta = nombreEtiqueta;
        }
    }

    public static class TagsRequest {
        @NotNull(message = "La lista de etiquetas es obligatoria")
        @NotEmpty(message = "Debe proporcionar al menos una etiqueta")
        private List<String> tagNames;

        public List<String> getTagNames() {
            return tagNames;
        }

        public void setTagNames(List<String> tagNames) {
            this.tagNames = tagNames;
        }
    }
}