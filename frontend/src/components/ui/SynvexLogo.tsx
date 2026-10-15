import React, { useState } from 'react';

interface SynvexLogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  variant?: 'full' | 'compact' | 'hero';
  alt?: string;
  onClick?: () => void;
}

export const SynvexLogo: React.FC<SynvexLogoProps> = ({
  className = '',
  width,
  height,
  variant = 'full',
  alt = 'SYNVEX — Detect, Analyze, Secure',
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  // Suggested sizing based on brand guidelines
  let defaultWidthClass = 'w-44 md:w-52';
  if (variant === 'hero') {
    defaultWidthClass = 'w-72 sm:w-96 md:w-[480px]';
  } else if (variant === 'compact') {
    defaultWidthClass = 'w-36 md:w-44';
  }

  const customStyle: React.CSSProperties = {};
  if (width) customStyle.width = typeof width === 'number' ? `${width}px` : width;
  if (height) customStyle.height = typeof height === 'number' ? `${height}px` : height;

  if (imageError) {
    return (
      <div 
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded border border-gold-border bg-surface-card text-gold-champagne font-semibold tracking-wider ${className}`}
        style={customStyle}
      >
        <span className="text-gold-primary tracking-widest text-lg font-bold">SYNVEX</span>
        <span className="text-xs text-text-muted hidden sm:inline">| AI Cyber-Forensics</span>
      </div>
    );
  }

  return (
    <div 
      className={`inline-block select-none overflow-hidden transition-all duration-300 ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
      onClick={onClick}
    >
      <img
        src="/images/synvex-logo.jpeg"
        alt={alt}
        className={`${width ? '' : defaultWidthClass} h-auto object-contain transition-transform duration-300`}
        style={customStyle}
        onError={() => setImageError(true)}
        loading="eager"
      />
    </div>
  );
};
