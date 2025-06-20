import React, { useState } from 'react';
import type { Post } from '../types/post';
import ReactionButton from './ReactionButton';
import CommentSection from './CommentSection';
import { MessageCircle, Share2, Bookmark, MoreHorizontal, CheckCircle } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onReaction: (postId: string, reactionType: string) => void;
}

const tagColors: Record<string, string> = {
  tecnologia: 'bg-blue-100 text-blue-800 border-blue-200',
  emprendimiento: 'bg-green-100 text-green-800 border-green-200',
  innovacion: 'bg-orange-100 text-orange-800 border-orange-200',
  mentoria: 'bg-purple-100 text-purple-800 border-purple-200'
};

const PostCard: React.FC<PostCardProps> = ({ post, onReaction }) => {
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    return `Hace ${Math.floor(diffInHours / 24)}d`;
  };

  const getTotalReactions = () => {
    return Object.values(post.reactions).reduce((sum, count) => sum + count, 0);
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-200/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
              />
              {post.author.verified && (
                <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 bg-white rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center space-x-1">
                <span>{post.author.name}</span>
              </h3>
              <p className="text-sm text-slate-600">{post.author.title}</p>
              <p className="text-xs text-slate-500">{formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                tagColors[tag] || 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      </div>

      {/* Reaction Stats */}
      {getTotalReactions() > 0 && (
        <div className="px-6 py-2 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center space-x-1">
              <div className="flex -space-x-1">
                {Object.entries(post.reactions).filter(([_, count]) => count > 0).slice(0, 3).map(([reaction]) => (
                  <div key={reaction} className="w-5 h-5 flex items-center justify-center text-sm">
                    {reaction === 'Me gusta' && '👍'}
                    {reaction === 'Me encanta' && '😍'}
                    {reaction === 'Celebrar' && '🎉'}
                    {reaction === 'Interesante' && '💡'}
                    {reaction === 'De acuerdo' && '🤝'}
                    {reaction === 'Hacer gracias' && '😄'}
                  </div>
                ))}
              </div>
              <span>{getTotalReactions()} reacciones</span>
            </div>
            <div className="flex items-center space-x-4">
              {post.comments.length > 0 && (
                <span>{post.comments.length} comentarios</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ReactionButton
            currentReaction={post.userReaction}
            reactions={post.reactions}
            onReaction={(reaction) => onReaction(post.id, reaction)}
          />
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Comentar</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection comments={post.comments} postId={post.id} />
      )}
    </article>
  );
};

export default PostCard;