import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  alpha: number;
  maxAlpha: number;
  fadeSpeed: number;
}

interface BackgroundEffectsProps {
  variant?: 'landing' | 'auth' | 'dashboard' | 'scanner' | 'results' | 'map' | 'minimal';
  intensity?: 'high' | 'medium' | 'subtle';
  showParticles?: boolean;
  showRings?: boolean;
}

export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({
  variant = 'dashboard',
  intensity = 'subtle',
  showParticles = true,
  showRings = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine particle density and ring visibility based on variant
  const isLanding = variant === 'landing';
  const isAuth = variant === 'auth';
  const shouldRenderRings = showRings || isLanding;

  useEffect(() => {
    if (!showParticles || variant === 'map') return;

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Subtle particle count (15 to 30 max for ultra-lightweight GPU footprint)
    const particleCount = isLanding ? 28 : isAuth ? 16 : 12;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.6,
        speedX: (Math.random() - 0.5) * 0.22,
        speedY: (Math.random() - 0.5) * 0.22 - 0.08,
        alpha: Math.random() * 0.4,
        maxAlpha: Math.random() * 0.35 + 0.15,
        fadeSpeed: 0.003 + Math.random() * 0.004,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render subtle drifting metallic-gold particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around viewport boundaries gently
        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        // Oscillate alpha
        p.alpha += p.fadeSpeed;
        if (p.alpha > p.maxAlpha || p.alpha < 0.05) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 98, ${Math.max(0, p.alpha)})`;
        ctx.shadowColor = 'rgba(244, 217, 149, 0.4)';
        ctx.shadowBlur = 4;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [showParticles, variant, isLanding, isAuth]);

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* 1. Cinematic Near-Black Surface Base */}
      <div className="absolute inset-0 bg-[#070707]" />

      {/* 2. Layered Secondary Radial Lighting */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isLanding
            ? 'opacity-100'
            : isAuth
            ? 'opacity-70'
            : variant === 'map'
            ? 'opacity-30'
            : 'opacity-50'
        }`}
        style={{
          backgroundImage: isLanding
            ? `
              radial-gradient(circle at 50% 15%, rgba(212, 175, 98, 0.07) 0%, transparent 55%),
              radial-gradient(circle at 85% 65%, rgba(244, 217, 149, 0.03) 0%, transparent 40%),
              radial-gradient(circle at 15% 85%, rgba(140, 113, 57, 0.04) 0%, transparent 45%)
            `
            : `
              radial-gradient(circle at 50% 0%, rgba(212, 175, 98, 0.05) 0%, transparent 60%),
              radial-gradient(circle at 100% 100%, rgba(140, 113, 57, 0.03) 0%, transparent 50%)
            `,
        }}
      />

      {/* 3. Fine Technical Forensic Grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundSize: isLanding ? '48px 48px' : '40px 40px',
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 1px, transparent 1px)
          `,
        }}
      />

      {/* 4. Faint Concentric Forensic Scanning Rings (SVG Geometry) */}
      {shouldRenderRings && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[800px] h-[800px] opacity-[0.14] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="400" cy="400" r="380" stroke="#D4AF62" strokeWidth="1" strokeDasharray="6 8" />
            <circle cx="400" cy="400" r="280" stroke="#F4D995" strokeWidth="1" />
            <circle cx="400" cy="400" r="180" stroke="#D4AF62" strokeWidth="1.2" strokeDasharray="10 12" />
            <circle cx="400" cy="400" r="90" stroke="#8C7139" strokeWidth="1" />
            {/* Coordinate Crosshairs */}
            <line x1="400" y1="20" x2="400" y2="780" stroke="#D4AF62" strokeWidth="0.8" strokeDasharray="4 6" opacity="0.4" />
            <line x1="20" y1="400" x2="780" y2="400" stroke="#D4AF62" strokeWidth="0.8" strokeDasharray="4 6" opacity="0.4" />
          </svg>
        </div>
      )}

      {/* 5. Extremely Subtle Gold Floating Particle Canvas */}
      {showParticles && variant !== 'map' && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}

      {/* 6. Soft Vignette to anchor depth and enhance contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(7, 7, 7, 0.65) 100%)',
        }}
      />
    </div>
  );
};
