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
     */
    @GetMapping("/search")
    public ResponseEntity<Tag> searchTagByName(@RequestParam String name) {
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        Optional<Tag> tag = tagService.getTagByName(name);
        return tag.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/tags - Crea una nueva etiqueta
     * Body: { "nombreEtiqueta": "nueva-etiqueta" }
     */
    @PostMapping
    public ResponseEntity<Tag> createTag(@RequestBody CreateTagRequest request) {
        // Validación manual
        if (request.getNombreEtiqueta() == null || request.getNombreEtiqueta().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Tag createdTag = tagService.createTag(request.getNombreEtiqueta().trim());
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
     * Header: X-User-ID: 1 (opcional)
     * Body: { "tagNames": ["etiqueta1", "etiqueta2"] }
     */
    @PostMapping("/posts/{postId}/tags")
    public ResponseEntity<PostDTO> addTagsToPost(
            @PathVariable Long postId,
            @RequestBody TagsRequest request,
            @RequestHeader(value = "X-User-ID", required = false) Long currentUserId) {
        
        // Validación manual
        if (request.getTagNames() == null || request.getTagNames().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
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
     */
    @PutMapping("/posts/{postId}/tags")
    public ResponseEntity<PostDTO> replacePostTags(
            @PathVariable Long postId,
            @RequestBody TagsRequest request,
            @RequestHeader(value = "X-User-ID", required = false) Long currentUserId) {
        
        // Validación manual
        if (request.getTagNames() == null) {
            return ResponseEntity.badRequest().build();
        }
        
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
     */
    @DeleteMapping("/posts/{postId}/tags")
    public ResponseEntity<PostDTO> removeTagsFromPost(
            @PathVariable Long postId,
            @RequestBody TagsRequest request,
            @RequestHeader(value = "X-User-ID", required = false) Long currentUserId) {
        
        // Validación manual
        if (request.getTagNames() == null || request.getTagNames().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
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
     */
    @GetMapping("/{tagName}/posts")
    public ResponseEntity<List<PostDTO>> getPostsByTag(
            @PathVariable String tagName,
            @RequestParam(value = "userId", required = false) Long currentUserId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        if (tagName == null || tagName.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            List<Post> posts = tagService.getPostsByTag(tagName);
            
            // Aplicar paginación
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

    // ========== ENDPOINT LEGACY (COMPATIBILIDAD) ==========

    /**
     * POST /api/tags/add-to-post/{postId} - Versión legacy
     * Mantiene compatibilidad con implementación anterior
     */
    @PostMapping("/add-to-post/{postId}")
    public ResponseEntity<PostDTO> addTagsToPostLegacy(
            @PathVariable Long postId,
            @RequestBody TagsRequest request,
            @RequestParam(value = "currentUserId", required = false) Long currentUserId) {
        return addTagsToPost(postId, request, currentUserId);
    }

    // ========== DTOs SIN VALIDATION ==========

    public static class CreateTagRequest {
        private String nombreEtiqueta;

        public String getNombreEtiqueta() {
            return nombreEtiqueta;
        }

        public void setNombreEtiqueta(String nombreEtiqueta) {
            this.nombreEtiqueta = nombreEtiqueta;
        }
    }

    public static class TagsRequest {
        private List<String> tagNames;

        public List<String> getTagNames() {
            return tagNames;
        }

        public void setTagNames(List<String> tagNames) {
            this.tagNames = tagNames;
        }
    }
}