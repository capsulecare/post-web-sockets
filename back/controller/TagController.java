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
     * GET /api/tags/by-name/{name} - Obtiene una etiqueta por su nombre
     */
    @GetMapping("/by-name/{name}")
    public ResponseEntity<Tag> getTagByName(@PathVariable String name) {
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

    /**
     * POST /api/tags/add-to-post/{postId} - Agrega etiquetas a un post
     * Body: { "tagNames": ["etiqueta1", "etiqueta2"] }
     */
    @PostMapping("/add-to-post/{postId}")
    public ResponseEntity<PostDTO> addTagsToPost(
            @PathVariable Long postId,
            @RequestBody TagsRequest request,
            @RequestParam(value = "currentUserId", required = false) Long currentUserId) {
        try {
            Post updatedPost = tagService.addTagsToPost(postId, request.getTagNames());
            
            // Convertir a DTO para la respuesta
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
     * PUT /api/tags/set-to-post/{postId} - Reemplaza todas las etiquetas de un post
     * Body: { "tagNames": ["etiqueta1", "etiqueta2"] }
     */
    @PutMapping("/set-to-post/{postId}")
    public ResponseEntity<PostDTO> setTagsToPost(
            @PathVariable Long postId,
            @RequestBody TagsRequest request,
            @RequestParam(value = "currentUserId", required = false) Long currentUserId) {
        try {
            Post updatedPost = tagService.setTagsToPost(postId, request.getTagNames());
            
            // Convertir a DTO para la respuesta
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
     * DELETE /api/tags/remove-from-post/{postId} - Remueve etiquetas específicas de un post
     * Body: { "tagNames": ["etiqueta1", "etiqueta2"] }
     */
    @DeleteMapping("/remove-from-post/{postId}")
    public ResponseEntity<PostDTO> removeTagsFromPost(
            @PathVariable Long postId,
            @RequestBody TagsRequest request,
            @RequestParam(value = "currentUserId", required = false) Long currentUserId) {
        try {
            Post updatedPost = tagService.removeTagsFromPost(postId, request.getTagNames());
            
            // Convertir a DTO para la respuesta
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
     * GET /api/tags/{tagName}/posts - Obtiene todos los posts con una etiqueta específica
     */
    @GetMapping("/{tagName}/posts")
    public ResponseEntity<List<PostDTO>> getPostsByTag(
            @PathVariable String tagName,
            @RequestParam(value = "currentUserId", required = false) Long currentUserId) {
        try {
            List<Post> posts = tagService.getPostsByTag(tagName);
            
            // Convertir a DTOs
            List<PostDTO> postDTOs = posts.stream()
                    .map(post -> postService.getPostById(post.getId(), currentUserId))
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .toList();
            
            return ResponseEntity.ok(postDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // DTO Classes para las requests
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