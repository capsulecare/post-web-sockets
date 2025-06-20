// src/components/PostsContainer.tsx
import React, { useState, useEffect } from 'react';
import PostCard from './PostCard'; // PostCard está en la misma carpeta 'components'
import { usePosts } from '../hooks/usePosts'; // El hook está en 'src/hooks'
import type { Post } from '../types/post'; // Los tipos están en 'src/types'

interface PostsContainerProps {
  selectedTag: string;
  currentUserId: string | null; // Pasa currentUserId desde el componente padre
}

const PostsContainer: React.FC<PostsContainerProps> = ({ selectedTag, currentUserId }) => {
  const { posts, loading, error, fetchPosts, handleReaction } = usePosts({ currentUserId });
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  // useEffect para filtrar posts basado en el tag seleccionado
  useEffect(() => {
    if (selectedTag === 'all') {  
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.tags.includes(selectedTag)));
    }
  }, [selectedTag, posts]); // Depende de selectedTag y del estado 'posts' (desde el hook)


  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500" role="status">
          <span className="visually-hidden">Cargando posts...</span>
        </div>
        <p className="mt-4 text-slate-600">Cargando posts...</p>
      </div>
    );
  }

  // Mostrar estado de error
  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>{error}</p>
        <button onClick={fetchPosts} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No hay posts para mostrar</h3>
          <p className="text-slate-500">Intenta cambiar el filtro o crea el primer post</p>
        </div>
      ) : (
        filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onReaction={handleReaction} // Ahora `handleReaction` viene del hook
            // Podrías necesitar pasar currentUserId y una función para manejar comentarios a PostCard también
            // si PostCard es responsable de crear comentarios.
          />
        ))
      )}
    </div>
  );
};

export default PostsContainer;