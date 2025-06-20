package com.skill.websockets.service;

import com.skill.websockets.model.Comment;
import com.skill.websockets.model.Post;
import com.skill.websockets.model.User;
import com.skill.websockets.model.TargetType; // Importa TargetType
import com.skill.websockets.dto.CommentDTO; // Importa CommentDTO
import com.skill.websockets.dto.UserDTO;    // Importa UserDTO (aunque UserDTO ya se importa dentro de CommentDTO)

import com.skill.websockets.repository.CommentRepository;
import com.skill.websockets.repository.PostRepository;
import com.skill.websockets.repository.UserRepository;
import com.skill.websockets.controller.WebSocketMessageController; // Importa el controlador WebSocket

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map; // Para el conteo de reacciones
import java.util.Comparator; // Para ordenar los comentarios/respuestas
import java.util.HashMap; // Necesario para inicializar el mapa de reacciones en el DTO

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final WebSocketMessageController webSocketMessageController;
    private final ReactionService reactionService; // Inyectar ReactionService

    @Autowired
    public CommentService(CommentRepository commentRepository,
                          UserRepository userRepository,
                          PostRepository postRepository,
                          WebSocketMessageController webSocketMessageController,
                          ReactionService reactionService) { // Añadir ReactionService al constructor
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.webSocketMessageController = webSocketMessageController;
        this.reactionService = reactionService; // Asignar
    }

    /**
     * MÉTODO CLAVE: Convierte la entidad Comment a un CommentDTO COMPLETO,
     * incluyendo conteos de reacciones, la reacción del usuario actual y respuestas anidadas.
     * Este método es recursivo para manejar las respuestas.
     *
     * @param comment La entidad Comment a convertir.
     * @param currentUserId El ID del usuario actual (puede ser null si no hay usuario logueado).
     * @return Un CommentDTO completamente poblado.
     */
    private CommentDTO convertToDto(Comment comment, Long currentUserId) {
        if (comment == null) {
            return null;
        }

        // Crear una instancia básica de CommentDTO usando el constructor que toma la entidad Comment.
        // Este constructor (CommentDTO(Comment comment)) ya debería mapear ID, autor, contenido, fechas, postId, parentCommentId.
        CommentDTO commentDTO = new CommentDTO(comment);

        // 1. Llenar reacciones del comentario (conteos reales)
        // Convierte el Map<String, Long> de ReactionService a Map<String, Integer> para CommentDTO
        Map<String, Long> reactionsLong = reactionService.getReactionsCountForTarget(comment.getId(), TargetType.COMMENT);
        Map<String, Integer> reactionsInteger = reactionsLong.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().intValue()));
        commentDTO.setReactions(reactionsInteger);


        // 2. Llenar la reacción del usuario actual al comentario (si hay un usuario logueado)
        if (currentUserId != null) {
            String userReaction = reactionService.getUserReactionForTarget(currentUserId, comment.getId(), TargetType.COMMENT);
            commentDTO.setUserReaction(userReaction);
        } else {
            commentDTO.setUserReaction(null); // No hay usuario logueado, no hay userReaction
        }

        // 3. Llenar las respuestas (recursivamente)
        // Obtenemos las respuestas directas de la entidad y las convertimos a DTOs.
        // Asegúrate de que las respuestas estén ordenadas (ej. por fecha de comentario).
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            List<CommentDTO> repliesDTO = comment.getReplies().stream()
                    // Ordena las respuestas por fecha de comentario (ascendente)
                    .sorted(Comparator.comparing(Comment::getFechaComentario))
                    .map(reply -> convertToDto(reply, currentUserId)) // Llamada recursiva para cada respuesta
                    .collect(Collectors.toList());
            commentDTO.setReplies(repliesDTO);
        } else {
            commentDTO.setReplies(List.of()); // Lista vacía inmutable si no hay respuestas
        }

        return commentDTO;
    }

    /**
     * Crea un nuevo comentario o una respuesta a un comentario existente.
     *
     * @param comment Entidad Comment con el contenido.
     * @param userId ID del usuario que crea el comentario.
     * @param postId ID del post al que pertenece el comentario.
     * @param parentCommentId ID del comentario padre si es una respuesta (null si es comentario de nivel superior).
     * @return La entidad Comment guardada.
     */
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

        // Convertir la entidad guardada a DTO para enviar por WebSocket
        // Para un comentario recién creado, los conteos de reacciones son 0 y userReaction es null
        CommentDTO commentDTO = new CommentDTO(savedComment);

        // Inicializar reacciones en el DTO (todas en 0 para un comentario nuevo)
        Map<String, Integer> initialReactions = new HashMap<>();
        initialReactions.put("recomendar", 0);
        initialReactions.put("apoyar", 0);
        initialReactions.put("celebrar", 0);
        initialReactions.put("encantar", 0);
        initialReactions.put("interesar", 0);
        initialReactions.put("hacer_gracia", 0);
        commentDTO.setReactions(initialReactions);
        commentDTO.setUserReaction(null); // Un nuevo comentario no tiene reacción de usuario por defecto

        // Mapear respuestas anidadas si existen (para un nuevo comentario, esto será vacío)
        if (savedComment.getReplies() != null && !savedComment.getReplies().isEmpty()) {
            commentDTO.setReplies(savedComment.getReplies().stream()
                    .map(reply -> convertToDto(reply, userId)) // Usar convertToDto para las respuestas
                    .collect(Collectors.toList()));
        } else {
            commentDTO.setReplies(List.of()); // Lista vacía si no hay respuestas
        }

        // Notificar el nuevo comentario a través de WebSocket con el DTO
        webSocketMessageController.notifyNewComment(commentDTO);

        return savedComment;
    }

    /**
     * Obtiene todos los comentarios de nivel superior para un post específico,
     * convertidos a DTOs y con sus reacciones y respuestas anidadas.
     *
     * @param postId El ID del post.
     * @param currentUserId El ID del usuario actual (para obtener userReaction).
     * @return Una lista de CommentDTOs.
     */
    public List<CommentDTO> getCommentsByPostId(Long postId, Long currentUserId) {
        List<Comment> topLevelComments = commentRepository.findByPost_IdAndParentCommentIsNullOrderByFechaComentarioAsc(postId);
        return topLevelComments.stream()
                .map(comment -> convertToDto(comment, currentUserId)) // Convierte cada comentario a DTO recursivamente
                .collect(Collectors.toList());
    }

    /**
     * Obtiene las respuestas directas a un comentario padre, convertidas a DTOs.
     * Este método puede ser útil para cargar respuestas de forma paginada o bajo demanda.
     *
     * @param parentCommentId El ID del comentario padre.
     * @param currentUserId El ID del usuario actual.
     * @return Una lista de CommentDTOs que son respuestas.
     */
    public List<CommentDTO> getRepliesByParentCommentId(Long parentCommentId, Long currentUserId) {
        List<Comment> replies = commentRepository.findByParentComment_IdOrderByFechaComentarioAsc(parentCommentId);
        return replies.stream()
                .map(reply -> convertToDto(reply, currentUserId))
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un comentario específico por su ID, convertido a DTO.
     *
     * @param id El ID del comentario.
     * @param currentUserId El ID del usuario actual.
     * @return Un Optional que contiene el CommentDTO si se encuentra.
     */
    public Optional<CommentDTO> getCommentById(Long id, Long currentUserId) {
        Optional<Comment> commentOptional = commentRepository.findById(id);
        return commentOptional.map(comment -> convertToDto(comment, currentUserId));
    }

    /**
     * Elimina un comentario por su ID.
     *
     * @param id El ID del comentario a eliminar.
     * @throws EntityNotFoundException Si el comentario no existe.
     */
    public void deleteComment(Long id) {
        if (!commentRepository.existsById(id)) {
            throw new EntityNotFoundException("Comentario no encontrado con ID: " + id);
        }
        commentRepository.deleteById(id);
    }
}