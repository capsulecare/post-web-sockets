// src/main/java/com/skill/websockets/service/PostService.java (OPTIMIZADO)
package com.skill.websockets.service;

import com.skill.websockets.model.Post;
import com.skill.websockets.model.User;
import com.skill.websockets.model.TargetType;
import com.skill.websockets.dto.PostDTO;
import com.skill.websockets.dto.CommentDTO;
import com.skill.websockets.dto.UserDTO;

import com.skill.websockets.repository.PostRepository;
import com.skill.websockets.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ReactionService reactionService;
    private final CommentService commentService;

    @Autowired
    public PostService(PostRepository postRepository,
                       UserRepository userRepository,
                       ReactionService reactionService,
                       CommentService commentService) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.reactionService = reactionService;
        this.commentService = commentService;
    }

    /**
     * ✅ OPTIMIZADO: Convierte Post a PostDTO con menos datos innecesarios
     */
    private PostDTO convertToDto(Post post, Long currentUserId) {
        if (post == null) {
            return null;
        }

        PostDTO postDTO = new PostDTO(post);

        // 1. ✅ OPTIMIZACIÓN: Solo agregar reacciones si hay alguna
        Map<String, Long> reactionsLong = reactionService.getReactionsCountForTarget(post.getId(), TargetType.POST);
        
        // Filtrar solo las reacciones que tienen conteo > 0
        Map<String, Integer> reactionsWithCounts = reactionsLong.entrySet().stream()
                .filter(entry -> entry.getValue() > 0) // ✅ Solo las que tienen conteo
                .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().intValue()));
        
        // Solo setear si hay reacciones
        if (!reactionsWithCounts.isEmpty()) {
            postDTO.setReactions(reactionsWithCounts);
        }

        // 2. ✅ OPTIMIZACIÓN: Solo agregar userReaction si existe
        if (currentUserId != null) {
            String userReaction = reactionService.getUserReactionForTarget(currentUserId, post.getId(), TargetType.POST);
            if (userReaction != null) { // Solo setear si no es null
                postDTO.setUserReaction(userReaction);
            }
        }

        // 3. Llenar los comentarios
        List<CommentDTO> commentDTOs = commentService.getCommentsByPostId(post.getId(), currentUserId);
        if (!commentDTOs.isEmpty()) {
            postDTO.setComments(commentDTOs);
        }

        return postDTO;
    }

    public List<PostDTO> getAllPosts(Long currentUserId) {
        List<Post> posts = postRepository.findAll();
        return posts.stream()
                .map(post -> convertToDto(post, currentUserId))
                .collect(Collectors.toList());
    }

    public Optional<PostDTO> getPostById(Long id, Long currentUserId) {
        Optional<Post> postOptional = postRepository.findById(id);
        return postOptional.map(post -> convertToDto(post, currentUserId));
    }

    public Post createPost(Post post, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + userId));

        post.setUser(user);
        post.setFechaPublicacion(LocalDateTime.now());
        post.setUltimaActualizacion(LocalDateTime.now());

        return postRepository.save(post);
    }

    public Post updatePost(Long id, Post postDetails) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post no encontrado con ID: " + id));

        existingPost.setTitulo(postDetails.getTitulo());
        existingPost.setContenido(postDetails.getContenido());
        existingPost.setUltimaActualizacion(LocalDateTime.now());

        return postRepository.save(existingPost);
    }

    public void deletePost(Long id) {
        if (!postRepository.existsById(id)) {
            throw new EntityNotFoundException("Post no encontrado con ID: " + id);
        }
        postRepository.deleteById(id);
    }

    public List<PostDTO> getPostsByUserId(Long userId, Long currentUserId) {
        List<Post> posts = postRepository.findByUser_Id(userId);
        return posts.stream()
                .map(post -> convertToDto(post, currentUserId))
                .collect(Collectors.toList());
    }
}