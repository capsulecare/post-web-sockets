package com.skill.websockets.repository;

import com.skill.websockets.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUser_Id(Long userId);

    // Puedes añadir métodos personalizados si los necesitas, por ejemplo:
    // List<Post> findByUserId(Long userId); // Encontrar posts por el ID de usuario
    // List<Post> findByTags_NombreEtiqueta(String tagName); // Encontrar posts por el nombre de la etiqueta
}