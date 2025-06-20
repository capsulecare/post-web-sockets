import React, { useState } from 'react';
import type { Post } from '../../types/post';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import ReactionStats from '../reaction/ReactionStats';
import CommentSection from '../comment/CommentSection';

interface PostCardProps {
  post: Post;
  onReaction: (postId: string, reactionType: string) => void;
  onCommentReaction?: (commentId: string, reactionType: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onReaction, 
  onCommentReaction
}) => {
  const [showComments, setShowComments] = useState(false);

  const handleReaction = (reactionType: string) => {
    onReaction(post.id, reactionType);
  };

  // ✅ NUEVO: Log para debug
  console.log(`🔄 Renderizando PostCard ${post.id}:`, {
    userReaction: post.userReaction,
    reactions: post.reactions,
    _lastUpdate: post._lastUpdate
  });

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-200/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <PostHeader
        author={post.author}
        tags={post.tags}
        createdAt={post.createdAt}
      />

      <PostContent content={post.content} />

      <ReactionStats
        reactions={post.reactions}
        commentsCount={post.comments.length}
      />

      <PostActions
        reactions={post.reactions}
        userReaction={post.userReaction}
        onReaction={handleReaction}
        onToggleComments={() => setShowComments(!showComments)}
        showComments={showComments}
      />

      {showComments && (
        <CommentSection 
          comments={post.comments} 
          postId={post.id}
          onCommentReaction={onCommentReaction}
          forceRenderKey={post._lastUpdate} // ✅ NUEVO: Usar _lastUpdate como key
        />
      )}
    </article>
  );
};

export default PostCard;