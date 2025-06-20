import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import type { User } from '../../types/post';

interface PostHeaderProps {
  author: User;
  tags: string[];
  createdAt: Date;
}

const PostHeader: React.FC<PostHeaderProps> = ({ author, tags, createdAt }) => {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    return `Hace ${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <div className="p-6 pb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* ✅ CAMBIO: Quitamos verified del Avatar */}
          <Avatar
            src={author.avatar}
            alt={author.name}
            size="lg"
          />
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center space-x-1">
              <span>{author.name}</span>
            </h3>
            <p className="text-sm text-slate-600">{author.title}</p>
            <p className="text-xs text-slate-500">{formatTimeAgo(createdAt)}</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full cursor-pointer">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* ✅ CAMBIO: Tags con colores dinámicos */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <Badge key={tag} variant={tag}>
            #{tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default PostHeader;