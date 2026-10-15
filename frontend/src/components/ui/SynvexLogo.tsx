import React, { useState } from 'react';

interface SynvexLogoProps {
  className?: string;
  size?: number; // Diameter of circular emblem in px (e.g., 48, 52, 72)
  width?: number | string;
  height?: number | string;
  variant?: 'circle' | 'hero' | 'compact' | 'full';
  showWordmark?: boolean;
  subtitle?: string;
  alt?: string;
  onClick?: () => void;
}

export const SynvexLogo: React.FC<SynvexLogoProps> = ({
  className = '',
  size,
  variant = 'circle',
  showWordmark = true,
  subtitle = 'AI CYBER-FORENSICS',
  alt = 'SYNVEX — Detect, Analyze, Secure',
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  // Sizing according to specifications:
  // Desktop navbar: 48-56px, mobile: 40-44px
  // Hero emblem: 64-80px
  let circleDimensionClass = 'w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13'; // ~44-52px
  let textClass = 'text-lg sm:text-xl';
  let subClass = 'text-[9px] tracking-wider';

  if (variant === 'hero') {
    circleDimensionClass = 'w-16 h-16 sm:w-20 sm:h-20'; // 64-80px
    textClass = 'text-2xl sm:text-3xl';
    subClass = 'text-[10px] tracking-widest';
  } else if (variant === 'compact') {
    circleDimensionClass = 'w-10 h-10 sm:w-11 sm:h-11'; // 40-44px
    textClass = 'text-base sm:text-lg';
    subClass = 'text-[8px] tracking-wider';
  }

  const customCircleStyle: React.CSSProperties = {};
  if (size) {
    customCircleStyle.width = `${size}px`;
    customCircleStyle.height = `${size}px`;
  }

  return (
    <div
      className={`inline-flex items-center gap-3 select-none transition-all duration-300 group ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {/* Circular Emblem Frame */}
      <div
        className={`${circleDimensionClass} rounded-full border border-gold-border/80 bg-black flex items-center justify-center overflow-hidden shrink-0 shadow-gold-subtle group-hover:border-gold-primary group-hover:shadow-gold-glow transition-all duration-300 relative`}
        style={customCircleStyle}
      >
        {imageError ? (
          <span className="font-bold text-gold-champagne font-mono text-sm tracking-wider">
            SX
          </span>
        ) : (
          <img
            src="/images/synvex-logo.jpeg"
            alt={alt}
            className="w-full h-full object-contain scale-[1.32] -translate-y-[4%] transition-transform duration-300 group-hover:scale-[1.36]"
            onError={() => setImageError(true)}
            loading="eager"
          />
        )}
      </div>

      {/* Brand Wordmark (optional / responsive) */}
      {showWordmark && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className={`${textClass} font-black tracking-widest text-text-main gold-gradient-text transition-all duration-300`}
          >
            SYNVEX
          </span>
          {subtitle && (
            <span
              className={`${subClass} font-mono font-medium text-text-muted mt-1 uppercase text-gold-champagne/70`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
