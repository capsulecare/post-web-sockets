package com.skill.websockets.repository;

import com.skill.websockets.model.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReactionTypeRepository extends JpaRepository<ReactionType, Long> {

    // Método para encontrar un tipo de reacción por su nombre
    Optional<ReactionType> findByNombreReaccion(String nombreReaccion);
}