import React, { useEffect, useState } from 'react';
import { ShieldCheck, Activity, Cpu, Database, Eye } from 'lucide-react';

export const DigitalShieldHero: React.FC = () => {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-[480px] mx-auto flex items-center justify-center p-4 select-none">
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-full bg-gold-primary/5 blur-3xl pointer-events-none" />

      {/* SVG Wireframe, Concentric Scanning Rings, and Shield Grid */}
      <svg className="w-full h-full relative z-10" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shieldGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4D995" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#D4AF62" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8C7139" stopOpacity="0.2" />
          </linearGradient>

          <radialGradient id="shieldCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4AF62" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#070707" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Concentric Coordinate Rings */}
        <circle cx="250" cy="250" r="230" stroke="rgba(212, 175, 98, 0.15)" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="250" cy="250" r="190" stroke="rgba(212, 175, 98, 0.22)" strokeWidth="1" />
        <circle cx="250" cy="250" r="140" stroke="rgba(212, 175, 98, 0.28)" strokeWidth="1.5" strokeDasharray="8 8" className="animate-spin" style={{ animationDuration: '60s' }} />

        {/* Ambient Center Glow */}
        <circle cx="250" cy="250" r="120" fill="url(#shieldCenterGlow)" />

        {/* Orbit Ellipses */}
        <ellipse cx="250" cy="250" rx="210" ry="85" stroke="rgba(244, 217, 149, 0.35)" strokeWidth="1.2" transform="rotate(-25 250 250)" />
        <ellipse cx="250" cy="250" rx="210" ry="85" stroke="rgba(212, 175, 98, 0.2)" strokeWidth="1" transform="rotate(35 250 250)" />

        {/* Rotating Radar Sweep Vector */}
        <line
          x1="250"
          y1="250"
          x2={250 + 190 * Math.cos((pulse * 3.6 * Math.PI) / 180)}
          y2={250 + 190 * Math.sin((pulse * 3.6 * Math.PI) / 180)}
          stroke="url(#shieldGoldGrad)"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />

        {/* Central Geometric Cyber-Shield Wireframe */}
        <path
          d="M 250 110 L 340 150 L 340 270 Q 340 370 250 410 Q 160 370 160 270 L 160 150 Z"
          fill="rgba(17, 17, 17, 0.75)"
          stroke="#D4AF62"
          strokeWidth="2"
        />
        <path
          d="M 250 135 L 320 168 L 320 260 Q 320 345 250 380 Q 180 345 180 260 L 180 168 Z"
          fill="none"
          stroke="rgba(244, 217, 149, 0.4)"
          strokeWidth="1"
          strokeDasharray="5 5"
        />

        {/* Core Crosshairs */}
        <line x1="250" y1="170" x2="250" y2="340" stroke="rgba(212, 175, 98, 0.3)" strokeWidth="1" />
        <line x1="200" y1="250" x2="300" y2="250" stroke="rgba(212, 175, 98, 0.3)" strokeWidth="1" />

        {/* Corner Telemetry Targets */}
        <circle cx="160" cy="150" r="3" fill="#D4AF62" />
        <circle cx="340" cy="150" r="3" fill="#D4AF62" />
        <circle cx="250" cy="410" r="4" fill="#F4D995" />
      </svg>

      {/* Center Shield Icon Core */}
      <div className="absolute z-20 flex flex-col items-center justify-center pointer-events-none">
        <div className="p-3.5 rounded-full bg-[#0D0D0D] border border-gold-border shadow-gold-glow">
          <ShieldCheck className="w-10 h-10 text-gold-champagne animate-pulse" />
        </div>
      </div>

      {/* Technical HUD Annotations floating around shield */}
      <div className="absolute top-4 left-2 z-30 px-3 py-1.5 rounded bg-[#111111]/90 border border-gold-border text-[11px] font-mono text-gold-champagne backdrop-blur flex items-center gap-1.5 shadow-sm">
        <Activity className="w-3.5 h-3.5 text-gold-primary" />
        <span>SIGNAL ANALYSIS: 2D FFT</span>
      </div>

      <div className="absolute top-10 right-0 z-30 px-3 py-1.5 rounded bg-[#111111]/90 border border-gold-border text-[11px] font-mono text-gold-champagne backdrop-blur flex items-center gap-1.5 shadow-sm">
        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
        <span>MODEL: CNN-v1.4 ACTIVE</span>
      </div>

      <div className="absolute bottom-8 left-4 z-30 px-3 py-1.5 rounded bg-[#111111]/90 border border-gold-border text-[11px] font-mono text-gold-champagne backdrop-blur flex items-center gap-1.5 shadow-sm">
        <Database className="w-3.5 h-3.5 text-gold-primary" />
        <span>EVIDENCE ENGINE: ON-LINE</span>
      </div>

      <div className="absolute bottom-4 right-6 z-30 px-3 py-1.5 rounded bg-[#111111]/90 border border-gold-border text-[11px] font-mono text-gold-champagne backdrop-blur flex items-center gap-1.5 shadow-sm">
        <Eye className="w-3.5 h-3.5 text-amber-400" />
        <span>EXPLAINABILITY: READY</span>
      </div>
    </div>
  );
};
