import React, { useState, useEffect } from 'react';
import PostCard from '../post/PostCard';
import { usePosts } from '../../hooks/usePosts';
import type { Post } from '../../types/post';

interface PostsContainerProps {
  selectedTag: string;
  currentUserId: string | null;
}

const PostsContainer: React.FC<PostsContainerProps> = ({ selectedTag, currentUserId }) => {
  const { 
    posts, 
    loading, 
    error, 
    fetchPosts, 
    handleReaction, 
    handleCommentReaction,
    handleNewComment // ✅ NUEVO: Obtener la función del hook
  } = usePosts({ currentUserId });
  
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (selectedTag === 'all') {  
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.tags.includes(selectedTag)));
    }
  }, [selectedTag, posts]);

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

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>{error}</p>
        <button onClick={fetchPosts} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">
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
            onReaction={handleReaction}
            onCommentReaction={handleCommentReaction}
            onNewComment={handleNewComment} // ✅ NUEVO: Pasar la función
          />
        ))
      )}
    </div>
  );
};

export default PostsContainer;