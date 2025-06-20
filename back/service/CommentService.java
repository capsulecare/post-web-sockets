package com.skill.websockets.service;

import com.skill.websockets.model.Comment;
import com.skill.websockets.model.Post;
import com.skill.websockets.model.User;
import com.skill.websockets.model.TargetType;
import com.skill.websockets.dto.CommentDTO;
import com.skill.websockets.dto.UserDTO;

import com.skill.websockets.repository.CommentRepository;
import com.skill.websockets.repository.PostRepository;
import com.skill.websockets.repository.UserRepository;
import com.skill.websockets.controller.WebSocketMessageController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.Comparator;
import java.util.HashMap;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final WebSocketMessageController webSocketMessageController;
    private final ReactionService reactionService;

    @Autowired
    public CommentService(CommentRepository commentRepository,
                          UserRepository userRepository,
                          PostRepository postRepository,
                          WebSocketMessageController webSocketMessageController,
                          ReactionService reactionService) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.webSocketMessageController = webSocketMessageController;
        this.reactionService = reactionService;
    }

    /**
     * ✅ OPTIMIZADO: Convierte Comment a CommentDTO con menos datos innecesarios
     */
    private CommentDTO convertToDto(Comment comment, Long currentUserId) {
        if (comment == null) {
            return null;
        }

        CommentDTO commentDTO = new CommentDTO(comment);

        // 1. ✅ OPTIMIZACIÓN: Solo agregar reacciones si hay alguna
        Map<String, Long> reactionsLong = reactionService.getReactionsCountForTarget(comment.getId(), TargetType.COMMENT);
        
        // Filtrar solo las reacciones que tienen conteo > 0
        Map<String, Integer> reactionsWithCounts = reactionsLong.entrySet().stream()
                .filter(entry -> entry.getValue() > 0) // ✅ Solo las que tienen conteo
                .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().intValue()));
        
        // Solo setear si hay reacciones
        if (!reactionsWithCounts.isEmpty()) {
            commentDTO.setReactions(reactionsWithCounts);
        }

        // 2. ✅ OPTIMIZACIÓN: Solo agregar userReaction si existe
        if (currentUserId != null) {
            String userReaction = reactionService.getUserReactionForTarget(currentUserId, comment.getId(), TargetType.COMMENT);
            if (userReaction != null) { // Solo setear si no es null
                commentDTO.setUserReaction(userReaction);
            }
        }

        // 3. Llenar las respuestas (recursivamente)
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            List<CommentDTO> repliesDTO = comment.getReplies().stream()
                    .sorted(Comparator.comparing(Comment::getFechaComentario))
                    .map(reply -> convertToDto(reply, currentUserId))
                    .collect(Collectors.toList());
            commentDTO.setReplies(repliesDTO);
        }

        return commentDTO;
    }

    public Comment createComment(Comment comment, Long userId, Long postId, Long parentCommentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + userId));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post no encontrado con ID: " + postId));

        comment.setUser(user);
        comment.setPost(post);
        comment.setFechaComentario(LocalDateTime.now());
        comment.setUltimaActualizacion(LocalDateTime.now());

        if (parentCommentId != null) {
            Comment parentComment = commentRepository.findById(parentCommentId)
                    .orElseThrow(() -> new EntityNotFoundException("Comentario padre no encontrado con ID: " + parentCommentId));
            comment.setParentComment(parentComment);
        }

        Comment savedComment = commentRepository.save(comment);

        // ✅ OPTIMIZADO: Crear DTO más limpio para WebSocket
        CommentDTO commentDTO = new CommentDTO(savedComment);
        
        // Para un comentario nuevo, no hay reacciones, así que no seteamos nada
        // (se omitirán automáticamente por @JsonInclude)
        
        // Mapear respuestas si existen (para un nuevo comentario, esto será vacío)
        if (savedComment.getReplies() != null && !savedComment.getReplies().isEmpty()) {
            commentDTO.setReplies(savedComment.getReplies().stream()
                    .map(reply -> convertToDto(reply, userId))
                    .collect(Collectors.toList()));
        }

        webSocketMessageController.notifyNewComment(commentDTO);

        return savedComment;
    }

    public List<CommentDTO> getCommentsByPostId(Long postId, Long currentUserId) {
        List<Comment> topLevelComments = commentRepository.findByPost_IdAndParentCommentIsNullOrderByFechaComentarioAsc(postId);
        return topLevelComments.stream()
                .map(comment -> convertToDto(comment, currentUserId))
                .collect(Collectors.toList());
    }

    public List<CommentDTO> getRepliesByParentCommentId(Long parentCommentId, Long currentUserId) {
        List<Comment> replies = commentRepository.findByParentComment_IdOrderByFechaComentarioAsc(parentCommentId);
        return replies.stream()
                .map(reply -> convertToDto(reply, currentUserId))
                .collect(Collectors.toList());
    }

    public Optional<CommentDTO> getCommentById(Long id, Long currentUserId) {
        Optional<Comment> commentOptional = commentRepository.findById(id);
        return commentOptional.map(comment -> convertToDto(comment, currentUserId));
    }

    public void deleteComment(Long id) {
        if (!commentRepository.existsById(id)) {
            throw new EntityNotFoundException("Comentario no encontrado con ID: " + id);
        }
        commentRepository.deleteById(id);
    }
}