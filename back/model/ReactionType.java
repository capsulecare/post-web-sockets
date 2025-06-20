package com.skill.websockets.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "tipo_reaccion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReactionType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombreReaccion; // Ej. "Me gusta", "Me encanta", "Interesante"

    // No se incluye `icono_url` aquí, ya que se manejará en el frontend.
}