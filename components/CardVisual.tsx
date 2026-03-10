import React from 'react';

interface Props {
  imageUrl?: string;
  playerName: string;
  year: string;
  set: string;
  grade: string;
  verdict: string;
}

export const CardVisual: React.FC<Props> = ({ imageUrl, playerName, year, set, grade, verdict }) => {
  // Fallback if no user image provided
  const displayImage = imageUrl || `https://picsum.photos/seed/${encodeURIComponent(playerName)}/400/560`;

  const getBorderColor = () => {
    if (verdict.includes('BUY')) return 'border-emerald-500/50 shadow-emerald-500/20';
    if (verdict.includes('PASS')) return 'border-yellow-500/50 shadow-yellow-500/20';
    if (verdict.includes('AVOID')) return 'border-red-500/50 shadow-red-500/20';
    return 'border-slate-500/50 shadow-slate-500/20';
  };

  return (
    <div className={`relative w-full max-w-[280px] mx-auto aspect-[3/4] bg-slate-900 rounded-xl border-4 ${getBorderColor()} shadow-2xl p-2 flex flex-col transition-transform hover:scale-105 duration-300`}>
      {/* Slab Label */}
      <div className="h-[15%] bg-slate-100 rounded-t-lg p-2 flex flex-col justify-center items-center border-b-2 border-slate-300 relative overflow-hidden">
        {/* Hologram effect */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-400 rounded-bl-full opacity-50"></div>
        
        <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase text-center leading-tight">
          {year} {set}
        </div>
        <div className="text-xs font-black text-slate-800 uppercase tracking-wide text-center truncate w-full">
          {playerName}
        </div>
        <div className="text-[10px] font-mono text-slate-600 bg-slate-200 px-2 rounded mt-1">
          {grade}
        </div>
      </div>

      {/* Card Image Area */}
      <div className="h-[85%] w-full relative rounded-b-lg overflow-hidden mt-1 bg-slate-800 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <img 
            src={displayImage} 
            alt={playerName}
            className="w-full h-full object-contain filter contrast-110"
        />
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 z-20 pointer-events-none"></div>
      </div>
    </div>
  );
};