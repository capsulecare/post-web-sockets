// src/main/java/com/skill/websockets/service/PostService.java (CORREGIDO)
package com.skill.websockets.service;

import com.skill.websockets.model.Post;
import com.skill.websockets.model.User;
import com.skill.websockets.model.TargetType; // Importa TargetType
import com.skill.websockets.dto.PostDTO;    // Importa PostDTO
import com.skill.websockets.dto.CommentDTO; // Importa CommentDTO (para los comentarios anidados)
import com.skill.websockets.dto.UserDTO;    // Importa UserDTO

import com.skill.websockets.repository.PostRepository;
import com.skill.websockets.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map; // Para el conteo de reacciones

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ReactionService reactionService; // Inyectar ReactionService
    private final CommentService commentService; // Inyectar CommentService

    @Autowired
    public PostService(PostRepository postRepository,
                       UserRepository userRepository,
                       ReactionService reactionService, // Añadir al constructor
                       CommentService commentService) { // Añadir al constructor
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.reactionService = reactionService; // Asignar
        this.commentService = commentService; // Asignar
    }

    // --- MÉTODO CLAVE: Convierte la entidad Post a un PostDTO COMPLETO ---
    // Este método es crucial para construir el PostDTO completo, incluyendo datos de otros servicios.
    private PostDTO convertToDto(Post post, Long currentUserId) {
        if (post == null) {
            return null;
        }

        PostDTO postDTO = new PostDTO(post); // Instancia el DTO con las propiedades directas (author, content, tags, createdAt)

        // AHORA LLENAMOS LOS CAMPOS QUE EL CONSTRUCTOR DEL DTO NO MANEJA DIRECTAMENTE:

        // 1. Llenar reacciones del post
        Map<String, Long> reactionsLong = reactionService.getReactionsCountForTarget(post.getId(), TargetType.POST);
        // CONVERSIÓN: Map<String, Long> a Map<String, Integer>
        Map<String, Integer> reactionsInteger = reactionsLong.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().intValue())); // Convertir Long a Integer
        postDTO.setReactions(reactionsInteger);


        // 2. Llenar la reacción del usuario actual al post (si hay un usuario logueado)
        if (currentUserId != null) {
            String userReaction = reactionService.getUserReactionForTarget(currentUserId, post.getId(), TargetType.POST);
            postDTO.setUserReaction(userReaction);
        } else {
            postDTO.setUserReaction(null); // No hay usuario logueado o no se proporcionó, no hay reacción de usuario
        }

        // 3. Llenar los comentarios
        // Llamamos a CommentService para obtener los comentarios ya en formato DTO.
        // Asumimos que CommentService.getCommentsByPostId devolverá List<CommentDTO> con sus reacciones y respuestas.
        List<CommentDTO> commentDTOs = commentService.getCommentsByPostId(post.getId(), currentUserId);
        postDTO.setComments(commentDTOs);

        return postDTO;
    }

    // Método para obtener todos los posts (ahora devuelve DTOs)
    // Se puede pasar un userId opcional para obtener la reacción del usuario a cada post
    public List<PostDTO> getAllPosts(Long currentUserId) { // Añade currentUserId como parámetro opcional
        List<Post> posts = postRepository.findAll();
        return posts.stream()
                .map(post -> convertToDto(post, currentUserId)) // Convierte cada entidad a DTO
                .collect(Collectors.toList());
    }

    // Método para obtener un post por su ID (ahora devuelve DTO)
    // Se puede pasar un userId opcional para obtener la reacción del usuario
    public Optional<PostDTO> getPostById(Long id, Long currentUserId) { // Añade currentUserId como parámetro opcional
        Optional<Post> postOptional = postRepository.findById(id);
        return postOptional.map(post -> convertToDto(post, currentUserId)); // Convierte la entidad a DTO si existe
    }

    // Método para crear un nuevo post (sigue devolviendo la entidad por simplicidad en la creación)
    // Si necesitas devolver DTO aquí, puedes convertirlo después de guardar la entidad.
    public Post createPost(Post post, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + userId));

        post.setUser(user);
        post.setFechaPublicacion(LocalDateTime.now());
        post.setUltimaActualizacion(LocalDateTime.now());

        return postRepository.save(post);
    }

    // Método para actualizar un post existente (sigue devolviendo la entidad)
    public Post updatePost(Long id, Post postDetails) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post no encontrado con ID: " + id));

        existingPost.setTitulo(postDetails.getTitulo());
        existingPost.setContenido(postDetails.getContenido());
        existingPost.setUltimaActualizacion(LocalDateTime.now());
        // Aquí no permitimos cambiar el usuario creador del post.

        return postRepository.save(existingPost);
    }

    // Método para eliminar un post
    public void deletePost(Long id) {
        if (!postRepository.existsById(id)) {
            throw new EntityNotFoundException("Post no encontrado con ID: " + id);
        }
        postRepository.deleteById(id);
    }

    // Otros métodos si los tenías, adaptados para devolver DTOs
    public List<PostDTO> getPostsByUserId(Long userId, Long currentUserId) {
        List<Post> posts = postRepository.findByUser_Id(userId); // Asumiendo que tienes este método en tu PostRepository
        return posts.stream()
                .map(post -> convertToDto(post, currentUserId))
                .collect(Collectors.toList());
    }
}