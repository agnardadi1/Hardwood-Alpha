import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="emeraldGrad" x1="32" y1="14" x2="32" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <filter id="glow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
      </defs>

      {/* Hexagon Background (Gem/Card Slab Shape) */}
      <path 
        d="M32 2L59.7 18V50L32 66L4.3 50V18L32 2Z" 
        className="fill-slate-900 stroke-slate-700" 
        strokeWidth="2" 
      />
      
      {/* Abstract Basketball Curves */}
      <path 
        d="M32 2V66 M4.3 18C4.3 18 18 28 32 28C46 28 59.7 18 59.7 18 M4.3 50C4.3 50 18 40 32 40C46 40 59.7 50 59.7 50" 
        className="stroke-slate-800" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />

      {/* Alpha Arrow / Trend Line */}
      <g filter="url(#glow)">
        <path 
            d="M32 12L46 42H18L32 12Z" 
            fill="url(#emeraldGrad)" 
            fillOpacity="0.2" 
        />
        <path 
            d="M22 42L32 12L42 42" 
            stroke="#34d399" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
        />
        <path 
            d="M32 28V48" 
            stroke="#34d399" 
            strokeWidth="2" 
            strokeLinecap="round" 
        />
      </g>
    </svg>
  );
};