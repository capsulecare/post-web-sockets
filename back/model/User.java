// src/main/java/com/skill/websockets/model/User.java
package com.skill.websockets.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonIgnore; // Importa esta anotación

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
// Excluye las relaciones para evitar bucles en equals/hashCode
@EqualsAndHashCode(exclude = {"posts", "comments", "reactions"})
// Excluye las relaciones para evitar bucles en toString
@ToString(exclude = {"posts", "comments", "reactions"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    @JsonIgnore // NO serializar la contraseña a JSON
    private String passwordHash;

    @Column(name = "nombre_usuario", nullable = false, unique = true)
    private String nombreUsuario; // Corresponde a 'name' en el frontend

    @Column(nullable = false)
    private String rol; // Por ejemplo, "USER", "ADMIN"

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "avatar_url") // Campo para la URL del avatar (ej. de Pexels)
    private String avatarUrl; // Corresponde a 'avatar' en el frontend

    @Column(name = "cuenta_verificada") // Campo booleano para indicar si la cuenta está verificada
    private Boolean cuentaVerificada; // Corresponde a 'verified' en el frontend

    // Relaciones OneToMany que NO deben ser serializadas con la entidad User directamente
    // (para evitar bucles y exponer datos innecesarios).
    // Si necesitas serializar estas relaciones, usa DTOs específicos para Posts, Comments, Reactions.
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Post> posts = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Comment> comments = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Reaction> reactions = new HashSet<>();
}