package com.skill.websockets.service;

import com.skill.websockets.model.Tag;
import com.skill.websockets.model.Post;
import com.skill.websockets.repository.TagRepository;
import com.skill.websockets.repository.PostRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;

@Service
public class TagService {

    private final TagRepository tagRepository;
    private final PostRepository postRepository;

    @Autowired
    public TagService(TagRepository tagRepository, PostRepository postRepository) {
        this.tagRepository = tagRepository;
        this.postRepository = postRepository;
    }

    /**
     * Obtiene todas las etiquetas disponibles
     */
    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    /**
     * Obtiene una etiqueta por su ID
     */
    public Optional<Tag> getTagById(Long id) {
        return tagRepository.findById(id);
    }

    /**
     * Obtiene una etiqueta por su nombre
     */
    public Optional<Tag> getTagByName(String nombreEtiqueta) {
        return tagRepository.findByNombreEtiqueta(nombreEtiqueta);
    }

    /**
     * Crea una nueva etiqueta
     */
    public Tag createTag(String nombreEtiqueta) {
        // Verificar si ya existe
        Optional<Tag> existingTag = tagRepository.findByNombreEtiqueta(nombreEtiqueta);
        if (existingTag.isPresent()) {
            return existingTag.get(); // Devolver la existente
        }

        Tag newTag = new Tag();
        newTag.setNombreEtiqueta(nombreEtiqueta);
        return tagRepository.save(newTag);
    }

    /**
     * Elimina una etiqueta por su ID
     */
    public void deleteTag(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new EntityNotFoundException("Etiqueta no encontrada con ID: " + id);
        }
        tagRepository.deleteById(id);
    }

    /**
     * Agrega etiquetas a un post existente
     */
    public Post addTagsToPost(Long postId, List<String> tagNames) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post no encontrado con ID: " + postId));

        Set<Tag> tagsToAdd = new HashSet<>();
        
        for (String tagName : tagNames) {
            // Buscar si la etiqueta ya existe, si no, crearla
            Tag tag = tagRepository.findByNombreEtiqueta(tagName)
                    .orElseGet(() -> createTag(tagName));
            tagsToAdd.add(tag);
        }

        // Agregar las nuevas etiquetas al post (sin eliminar las existentes)
        post.getTags().addAll(tagsToAdd);
        
        return postRepository.save(post);
    }

    /**
     * Reemplaza todas las etiquetas de un post
     */
    public Post setTagsToPost(Long postId, List<String> tagNames) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post no encontrado con ID: " + postId));

        // Limpiar etiquetas existentes
        post.getTags().clear();

        // Agregar las nuevas etiquetas
        Set<Tag> newTags = new HashSet<>();
        
        for (String tagName : tagNames) {
            Tag tag = tagRepository.findByNombreEtiqueta(tagName)
                    .orElseGet(() -> createTag(tagName));
            newTags.add(tag);
        }

        post.getTags().addAll(newTags);
        
        return postRepository.save(post);
    }

    /**
     * Remueve etiquetas específicas de un post
     */
    public Post removeTagsFromPost(Long postId, List<String> tagNames) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post no encontrado con ID: " + postId));

        for (String tagName : tagNames) {
            Optional<Tag> tagOptional = tagRepository.findByNombreEtiqueta(tagName);
            if (tagOptional.isPresent()) {
                post.getTags().remove(tagOptional.get());
            }
        }
        
        return postRepository.save(post);
    }

    /**
     * Obtiene todos los posts que tienen una etiqueta específica
     */
    public List<Post> getPostsByTag(String tagName) {
        Optional<Tag> tagOptional = tagRepository.findByNombreEtiqueta(tagName);
        if (tagOptional.isPresent()) {
            Tag tag = tagOptional.get();
            return tag.getPosts().stream().toList();
        }
        return List.of(); // Lista vacía si la etiqueta no existe
    }
}