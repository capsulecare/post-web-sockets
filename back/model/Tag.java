package com.skill.websockets.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode; // Para manejar la unicidad en colecciones
import lombok.ToString;        // Para evitar bucles infinitos con relaciones bidireccionales

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "etiquetas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "posts") // Excluir 'posts' para evitar recursión y problemas de rendimiento en equals/hashCode
@ToString(exclude = "posts")         // Excluir 'posts' para evitar bucles infinitos en toString
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombreEtiqueta;

    // Relación ManyToMany con Post (inversa de la relación en Post)
    // MappedBy indica que Post es el dueño de la relación (el que tiene @JoinTable)
    @ManyToMany(mappedBy = "tags")
    private Set<Post> posts = new HashSet<>(); // Inicializar para evitar NullPointerException
}