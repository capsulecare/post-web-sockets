import React, { useState } from 'react';
import { X, Image, Video, FileText, Hash, Users } from 'lucide-react';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { AVAILABLE_TAGS, getTagLabel } from '../../constants/tags';

interface CreatePostModalProps {
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose }) => {
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [postType, setPostType] = useState<'normal' | 'mentoria' | 'colaboracion'>('normal');

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && selectedTags.length > 0) {
      console.log('Crear post:', { content, selectedTags, postType });
      onClose();
    }
  };

  const getCharacterCount = () => content.length;
  const maxCharacters = 2000;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Crear nuevo post</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={X}
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full"
          />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(90vh-120px)]">
          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Post Type Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Tipo de publicación</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPostType('normal')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    postType === 'normal'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <FileText className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Post Normal</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPostType('mentoria')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    postType === 'mentoria'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Users className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Ofrecer Mentoría</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPostType('colaboracion')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    postType === 'colaboracion'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Hash className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Buscar Colaboración</span>
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 mb-4">
              <Avatar
                src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=150"
                alt="Tu avatar"
                size="lg"
              />
              <div>
                <h3 className="font-semibold text-slate-900">Usuario Actual</h3>
                <p className="text-sm text-slate-600">Emprendedor</p>
              </div>
            </div>

            {/* Content Input */}
            <div className="mb-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`¿Qué quieres compartir${
                  postType === 'mentoria' ? ' sobre tu mentoría' : 
                  postType === 'colaboracion' ? ' sobre tu proyecto' : ''
                }?`}
                className="w-full h-40 p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-500 text-lg"
                maxLength={maxCharacters}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center space-x-4 text-slate-400">
                  <Button variant="ghost" size="sm" icon={Image} className="hover:text-blue-500" />
                  <Button variant="ghost" size="sm" icon={Video} className="hover:text-blue-500" />
                </div>
                <span className={`text-sm ${
                  getCharacterCount() > maxCharacters * 0.9 ? 'text-red-500' : 'text-slate-500'
                }`}>
                  {getCharacterCount()}/{maxCharacters}
                </span>
              </div>
            </div>

            {/* ✅ ACTUALIZADO: Tags Selection usando AVAILABLE_TAGS */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Etiquetas (selecciona al menos una)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 cursor-pointer text-left ${
                      selectedTags.includes(tag.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                    title={tag.description} // ✅ NUEVO: Tooltip con descripción
                  >
                    <Badge variant={tag.id} className="mb-1">
                      #{tag.shortLabel || tag.label}
                    </Badge>
                    {/* ✅ NUEVO: Mostrar descripción en texto pequeño */}
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {tag.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {(content.trim() || selectedTags.length > 0) && (
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Vista previa</h3>
                <div className="bg-white rounded-lg p-4 border border-slate-100">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar
                      src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=150"
                      alt="Tu avatar"
                      size="sm"
                    />
                    <div>
                      <h4 className="font-semibold text-sm">Usuario Actual</h4>
                      <p className="text-xs text-slate-500">Ahora</p>
                    </div>
                  </div>
                  
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedTags.map((tagId) => (
                        <Badge key={tagId} variant={tagId}>
                          #{getTagLabel(tagId)}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">
                    {content || 'Tu contenido aparecerá aquí...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                {selectedTags.length === 0 && (
                  <span className="text-red-500">Selecciona al menos una etiqueta</span>
                )}
                {selectedTags.length > 0 && (
                  <span className="text-green-600">
                    ✓ {selectedTags.length} etiqueta{selectedTags.length > 1 ? 's' : ''} seleccionada{selectedTags.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!content.trim() || selectedTags.length === 0}
                  className={`${
                    content.trim() && selectedTags.length > 0
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : ''
                  }`}
                >
                  Publicar
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;