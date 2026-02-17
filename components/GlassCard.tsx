
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", title }) => {
  return (
    <div className={`glass rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:bg-white/15 ${className}`}>
      {title && <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-4">{title}</h3>}
      {children}
    </div>
  );
};
