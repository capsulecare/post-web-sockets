package com.skill.websockets.repository;

import com.skill.websockets.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    // Método para encontrar una etiqueta por su nombre
    Optional<Tag> findByNombreEtiqueta(String nombreEtiqueta);
}