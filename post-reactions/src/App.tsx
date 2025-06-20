import { useState } from 'react';
import PostsContainer from './components/PostsContainer';
import CreatePostModal from './components/CreatePostModal';
import Header from './components/Header';

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  // Nuevo estado para el ID del usuario actual
  // Para pruebas, puedes hardcodear un ID que sepas que existe en tu base de datos de usuarios.
  // Por ejemplo, '1', '2', etc., dependiendo de los IDs de tus usuarios.
  const [currentUserId] = useState<string | null>('1'); // Asume que el usuario con ID '1' existe y está logueado.
  // En una aplicación real, este valor sería dinámico, obtenido de tu sistema de autenticación.

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header
        onCreatePost={() => setIsCreateModalOpen(true)}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
      />

      <main className="container mx-auto px-4 py-8">
        <PostsContainer
          selectedTag={selectedTag}
          currentUserId={currentUserId} // ¡Aquí pasamos el ID del usuario!
        />
      </main>

      {isCreateModalOpen && (
        <CreatePostModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
}

export default App;