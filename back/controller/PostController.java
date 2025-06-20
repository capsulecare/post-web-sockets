package com.skill.websockets.controller;

import com.skill.websockets.model.Post; // Sigue siendo necesario para @RequestBody en create/update
import com.skill.websockets.dto.PostDTO; // Importa PostDTO
import com.skill.websockets.service.PostService; // Importa PostService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    @Autowired
    public PostController(PostService postService) {
        this.postService = postService;
    }

    /**
     * Obtiene todos los posts, convertidos a PostDTOs.
     * Permite especificar un currentUserId para personalizar las reacciones del usuario.
     *
     * @param currentUserId ID del usuario actual (opcional), para obtener su reacción a cada post.
     * @return ResponseEntity con una lista de PostDTOs.
     */
    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts(@RequestParam(value = "currentUserId", required = false) Long currentUserId) {
        // El PostService ya devuelve List<PostDTO> y maneja la conversión y reacciones.
        List<PostDTO> posts = postService.getAllPosts(currentUserId);
        return ResponseEntity.ok(posts);
    }

    /**
     * Obtiene un post específico por su ID, convertido a PostDTO.
     * Permite especificar un currentUserId para personalizar la reacción del usuario.
     *
     * @param id ID del post.
     * @param currentUserId ID del usuario actual (opcional), para obtener su reacción al post.
     * @return ResponseEntity con el PostDTO si se encuentra.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable Long id,
                                               @RequestParam(value = "currentUserId", required = false) Long currentUserId) {
        // El PostService ya devuelve Optional<PostDTO>
        Optional<PostDTO> post = postService.getPostById(id, currentUserId);
        return post.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Obtiene posts por el ID de su autor, convertidos a PostDTOs.
     * Permite especificar un currentUserId para personalizar las reacciones del usuario.
     *
     * @param userId ID del autor del post.
     * @param currentUserId ID del usuario actual (opcional), para obtener su reacción a cada post.
     * @return ResponseEntity con una lista de PostDTOs.
     */
    @GetMapping("/byUser/{userId}")
    public ResponseEntity<List<PostDTO>> getPostsByUserId(@PathVariable Long userId,
                                                          @RequestParam(value = "currentUserId", required = false) Long currentUserId) {
        // El PostService ya devuelve List<PostDTO>
        List<PostDTO> posts = postService.getPostsByUserId(userId, currentUserId);
        if (posts.isEmpty()) {
            return ResponseEntity.notFound().build(); // O ResponseEntity.ok(List.of()) si quieres devolver una lista vacía
        }
        return ResponseEntity.ok(posts);
    }

    /**
     * Crea un nuevo post.
     * Recibe la entidad Post en el cuerpo de la solicitud y el ID del usuario como RequestParam.
     * Devuelve el PostDTO del post creado en la respuesta.
     *
     * @param post La entidad Post a crear (solo con título y contenido).
     * @param userId ID del usuario autor del post.
     * @return ResponseEntity con el PostDTO del post creado.
     */
    @PostMapping
    public ResponseEntity<PostDTO> createPost(@RequestBody Post post, @RequestParam("userId") Long userId) {
        try {
            // El servicio crea y guarda la entidad Post.
            Post savedPostEntity = postService.createPost(post, userId);

            // Luego, obtenemos el PostDTO completo, incluyendo reacciones e información del usuario,
            // llamando al método getPostById del servicio. Aquí, el userId que crea el post es el
            // currentUserId para obtener su reacción (que sería null inicialmente en un post nuevo).
            PostDTO savedPostDTO = postService.getPostById(savedPostEntity.getId(), userId)
                    .orElseThrow(() -> new RuntimeException("Error al recuperar el PostDTO después de la creación."));

            return new ResponseEntity<>(savedPostDTO, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * Actualiza un post existente.
     * Recibe el ID del post en la URL y los detalles actualizados en el cuerpo.
     * Devuelve el PostDTO del post actualizado en la respuesta.
     *
     * @param id ID del post a actualizar.
     * @param postDetails Entidad Post con los detalles a actualizar (título, contenido).
     * @param currentUserId ID del usuario actual (opcional), para personalizar la reacción en la respuesta.
     * @return ResponseEntity con el PostDTO del post actualizado.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PostDTO> updatePost(@PathVariable Long id,
                                              @RequestBody Post postDetails,
                                              @RequestParam(value = "currentUserId", required = false) Long currentUserId) {
        try {
            // El servicio actualiza y guarda la entidad Post.
            Post updatedPostEntity = postService.updatePost(id, postDetails);

            // Luego, obtenemos el PostDTO completo para la respuesta.
            PostDTO updatedPostDTO = postService.getPostById(updatedPostEntity.getId(), currentUserId)
                    .orElseThrow(() -> new RuntimeException("Error al recuperar el PostDTO después de la actualización."));

            return ResponseEntity.ok(updatedPostDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Elimina un post por su ID.
     *
     * @param id ID del post a eliminar.
     * @return ResponseEntity con estado 204 No Content si la eliminación fue exitosa.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        try {
            postService.deletePost(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}