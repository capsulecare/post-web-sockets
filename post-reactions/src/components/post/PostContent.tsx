import React from 'react';

interface PostContentProps {
  content: string;
}

const PostContent: React.FC<PostContentProps> = ({ content }) => {
  return (
    <div className="px-6 pb-4">
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </div>
  );
};

export default PostContent;