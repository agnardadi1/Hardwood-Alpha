import React, { useEffect, useState } from 'react';

interface Props {
  label: string;
  score: number;
  max: number;
  delay?: number;
  reason?: string;
}

export const ScoreBar: React.FC<Props> = ({ label, score, max, delay = 0, reason }) => {
  const [width, setWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const percentage = Math.min(100, (score / max) * 100);
  
  // Color calculation based on score percentage with glow effect
  const getColor = () => {
    if (percentage >= 80) return 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
    if (percentage >= 60) return 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]';
    if (percentage >= 40) return 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.5)]';
    return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]';
  };

  const getTextColor = () => {
    if (percentage >= 80) return 'text-emerald-400';
    if (percentage >= 60) return 'text-cyan-400';
    if (percentage >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  useEffect(() => {
    // Reveal the container
    const revealTimer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    // Fill the bar shortly after reveal
    const fillTimer = setTimeout(() => {
      setWidth(percentage);
    }, delay + 200);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(fillTimer);
    };
  }, [percentage, delay]);

  return (
    <div 
      className={`mb-6 group transition-all duration-700 ease-out transform
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
      `}
    >
      <div className="flex justify-between items-end mb-2">
        <span className="text-[11px] font-display font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
        <span className={`text-lg font-display font-bold ${getTextColor()}`}>
            {score}<span className="text-slate-500 text-xs ml-0.5">/{max}</span>
        </span>
      </div>
      
      {/* Track */}
      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
         {/* Background Grid Pattern */}
         <div className="absolute inset-0 w-full h-full opacity-30" style={{backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.8) 50%)', backgroundSize: '4px 100%'}}></div>
         
         {/* Filled Bar */}
        <div 
            className={`h-full rounded-full transition-all duration-[1200ms] cubic-bezier(0.34, 1.56, 0.64, 1) relative ${getColor()}`}
            style={{ width: `${width}%` }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
        </div>
      </div>

      {reason && (
        <div className={`text-xs text-slate-400 font-mono leading-relaxed pl-3 border-l-2 border-slate-700 transition-all duration-500 mt-2
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
            group-hover:border-emerald-500/50 group-hover:text-slate-300
        `}>
            {reason}
        </div>
      )}
    </div>
  );
};