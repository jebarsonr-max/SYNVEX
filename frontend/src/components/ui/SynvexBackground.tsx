import React from 'react';
import { BackgroundEffects } from './BackgroundEffects';

export interface SynvexBackgroundProps {
  variant?: 'landing' | 'auth' | 'dashboard' | 'scanner' | 'results' | 'map' | 'minimal';
  intensity?: 'high' | 'medium' | 'subtle';
  showParticles?: boolean;
  showRings?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const SynvexBackground: React.FC<SynvexBackgroundProps> = ({
  variant = 'dashboard',
  intensity = 'subtle',
  showParticles = true,
  showRings,
  className = '',
  children,
}) => {
  return (
    <div className={`relative min-h-screen bg-[#070707] text-[#F5F5F5] ${className}`}>
      {/* Background Graphic Layer */}
      <BackgroundEffects
        variant={variant}
        intensity={intensity}
        showParticles={showParticles}
        showRings={showRings}
      />

      {/* Foreground Content Layer */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
};
