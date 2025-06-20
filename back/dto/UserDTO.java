// src/main/java/com/skill/websockets/dto/UserDTO.java (AJUSTADO)
package com.skill.websockets.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import com.skill.websockets.model.User; // Importa la entidad User para el constructor de conversión

@Data // Genera getters, setters, toString, equals, hashCode
@NoArgsConstructor // Genera un constructor sin argumentos
@AllArgsConstructor // Genera un constructor con todos los argumentos
public class UserDTO {
    private String id; // Frontend espera 'string' para los IDs
    private String name; // Corresponde a 'nombreUsuario' de la entidad
    private String avatar; // Corresponde a 'avatarUrl' de la entidad
    private String title; // AHORA: Corresponde a 'rol' de la entidad User
    private Boolean verified; // Corresponde a 'cuentaVerificada' de la entidad

    // Constructor que convierte una entidad User a un UserDTO
    public UserDTO(User user) {
        if (user != null) { // Asegúrate de que el usuario no sea nulo
            this.id = user.getId() != null ? user.getId().toString() : null; // Convertir Long a String
            this.name = user.getNombreUsuario();
            this.avatar = user.getAvatarUrl();
            this.title = user.getRol(); // <--- AJUSTE AQUÍ: Mapea 'rol' a 'title'
            this.verified = user.getCuentaVerificada();
        }
    }
}