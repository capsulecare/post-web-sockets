// src/main/java/com/skill/websockets/repository/ReactionRepository.java
package com.skill.websockets.repository;

import com.skill.websockets.model.Reaction;
import com.skill.websockets.model.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Reaction.ReactionId> {

    Optional<Reaction> findById_UserIdAndId_TargetIdAndId_TargetType(Long userId, Long targetId, TargetType targetType);

    void deleteById_UserIdAndId_TargetIdAndId_TargetType(Long userId, Long targetId, TargetType targetType);

    // Consulta JPQL explícita para contar reacciones por tipo para un target específico
    // ¡CORREGIDO: Usando 'nombreReaccion' en lugar de 'nombreTipo'!
    @Query("SELECT rt.nombreReaccion, COUNT(r) " +
            "FROM Reaction r JOIN r.reactionType rt " +
            "WHERE r.id.targetId = :targetId AND r.id.targetType = :targetType " +
            "GROUP BY rt.nombreReaccion")
    List<Object[]> countReactionsByTargetIdAndTargetType(@Param("targetId") Long targetId, @Param("targetType") TargetType targetType);

    // Consulta JPQL explícita para obtener el tipo de reacción de un usuario para un target
    // ¡CORREGIDO: Usando 'nombreReaccion' en lugar de 'nombreTipo'!
    @Query("SELECT r.reactionType.nombreReaccion FROM Reaction r " +
            "WHERE r.id.userId = :userId AND r.id.targetId = :targetId AND r.id.targetType = :targetType")
    Optional<String> findUserReactionTypeByUserIdAndTargetIdAndTargetType(
            @Param("userId") Long userId,
            @Param("targetId") Long targetId,
            @Param("targetType") TargetType targetType);
}