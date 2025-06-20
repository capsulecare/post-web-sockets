import React from 'react';
import { Plus, Filter, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { tagGradients } from '../../constants/tagColors';

interface HeaderProps {
  onCreatePost: () => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
}

// ✅ ACTUALIZADO: Tags con nombres reales y mapeo a gradientes
const tags = [
  { id: 'all', label: 'Todos', gradient: tagGradients.all },
  { id: 'Tecnología', label: 'Tecnología', gradient: tagGradients.tecnologia },
  { id: 'Negocios y Emprendimiento', label: 'Negocios', gradient: tagGradients.negocios },
  { id: 'Arte y Creatividad', label: 'Arte', gradient: tagGradients.arte },
  { id: 'Ciencia y Educación', label: 'Ciencia', gradient: tagGradients.ciencia },
  { id: 'Salud y Bienestar', label: 'Salud', gradient: tagGradients.salud },
  { id: 'Deportes', label: 'Deportes', gradient: tagGradients.deportes },
  { id: 'Video Juegos y Entretenimiento', label: 'Gaming', gradient: tagGradients.gaming }
];

const Header: React.FC<HeaderProps> = ({ onCreatePost, selectedTag, onTagChange }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillLink Emprendedor
              </h1>
              <p className="text-sm text-slate-600">Conecta, aprende y emprende</p>
            </div>
          </div>
          
          <Button
            onClick={onCreatePost}
            icon={Plus}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Crear Post
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-slate-500" />
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onTagChange(tag.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 cursor-pointer ${
                  selectedTag === tag.id
                    ? `${tag.gradient} text-white shadow-lg`
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;