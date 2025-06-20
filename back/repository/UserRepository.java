package com.skill.websockets.repository;

import com.skill.websockets.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional; // Usaremos Optional para métodos que pueden no encontrar un resultado

@Repository // Indica que esta interfaz es un componente de repositorio de Spring
public interface UserRepository extends JpaRepository<User, Long> {
    // JpaRepository<TipoDeEntidad, TipoDeIdDeLaEntidad>

    // Método personalizado para encontrar un usuario por su email
    Optional<User> findByEmail(String email);

    // Método personalizado para encontrar un usuario por su nombre de usuario
    Optional<User> findByNombreUsuario(String nombreUsuario);
}