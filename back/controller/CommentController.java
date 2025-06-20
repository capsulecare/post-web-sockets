// src/main/java/com/skill/websockets/controller/CommentController.java (AJUSTADO)
package com.skill.websockets.controller;

import com.skill.websockets.model.Comment; // Sigue siendo necesario para @RequestBody en create
import com.skill.websockets.dto.CommentDTO; // Importa CommentDTO
import com.skill.websockets.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    @Autowired
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // POST: Crear un nuevo comentario (o una respuesta)
    // El método createComment del servicio devuelve la entidad Comment.
    // Convertimos la entidad guardada a DTO para la respuesta.
    @PostMapping
    public ResponseEntity<CommentDTO> createComment(
            @RequestBody Comment comment,
            @RequestParam("postId") Long postId,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "parentCommentId", required = false) Long parentCommentId) {
        try {
            Comment savedComment = commentService.createComment(comment, userId, postId, parentCommentId);
            // Convertir la entidad guardada a DTO para la respuesta.
            // Pasamos el 'userId' como 'currentUserId' para que se obtenga la reacción del usuario.
            CommentDTO savedCommentDTO = commentService.getCommentById(savedComment.getId(), userId)
                    .orElseThrow(() -> new RuntimeException("Error al recuperar el CommentDTO después de la creación"));
            return new ResponseEntity<>(savedCommentDTO, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // GET: Obtener comentarios de un post específico (ahora devuelve DTOs)
    // currentUserId es opcional para obtener la reacción del usuario y respuestas recursivas
    @GetMapping("/byPost/{postId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByPostId(@PathVariable Long postId,
                                                                @RequestParam(value = "currentUserId", required = false) Long currentUserId) {
        List<CommentDTO> comments = commentService.getCommentsByPostId(postId, currentUserId);
        if (comments.isEmpty()) {
            return ResponseEntity.ok(List.of()); // Devuelve lista vacía en lugar de 404 si no hay comentarios
        }
        return ResponseEntity.ok(comments);
    }

    // GET: Obtener respuestas a un comentario específico (ahora devuelve DTOs)
    // currentUserId es opcional para obtener la reacción del usuario y respuestas recursivas
    @GetMapping("/byParent/{parentCommentId}")
    public ResponseEntity<List<CommentDTO>> getRepliesByParentCommentId(@PathVariable Long parentCommentId,
                                                                        @RequestParam(value = "currentUserId", required = false) Long currentUserId) {
        try {
            List<CommentDTO> replies = commentService.getRepliesByParentCommentId(parentCommentId, currentUserId);
            return ResponseEntity.ok(replies);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET: Obtener un comentario por su ID (ahora devuelve DTO)
    // currentUserId es opcional para obtener la reacción del usuario y respuestas recursivas
    @GetMapping("/{id}")
    public ResponseEntity<CommentDTO> getCommentById(@PathVariable Long id,
                                                     @RequestParam(value = "currentUserId", required = false) Long currentUserId) {
        Optional<CommentDTO> comment = commentService.getCommentById(id, currentUserId);
        return comment.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        try {
            commentService.deleteComment(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}