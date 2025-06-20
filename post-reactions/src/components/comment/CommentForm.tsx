import React, { useState } from 'react';
import { Send, Smile } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({ 
  onSubmit, 
  placeholder = "Escribe un comentario..." 
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <div className="p-6 border-t border-slate-100">
      <form onSubmit={handleSubmit} className="flex items-start space-x-3">
        <Avatar
          src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=150"
          alt="Tu avatar"
          size="md"
        />
        
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-500 min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          <div className="flex items-center justify-between mt-3">
            <Button
              variant="ghost"
              size="sm"
              icon={Smile}
              className="text-slate-400 hover:text-slate-600 p-1"
            />
            
            <Button
              type="submit"
              disabled={!content.trim()}
              icon={Send}
              size="sm"
              variant={content.trim() ? 'primary' : 'secondary'}
            >
              Comentar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;