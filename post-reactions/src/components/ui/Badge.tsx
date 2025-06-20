import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'tecnologia' | 'emprendimiento' | 'innovacion' | 'mentoria';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    tecnologia: 'bg-blue-100 text-blue-800 border-blue-200',
    emprendimiento: 'bg-green-100 text-green-800 border-green-200',
    innovacion: 'bg-orange-100 text-orange-800 border-orange-200',
    mentoria: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;