import React, { useEffect, useState } from 'react';
import { EvaluationResult, SCORING_CRITERIA } from '../types';
import { ScoreBar } from './ScoreBar';
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Target
} from 'lucide-react';

interface Props {
  result: EvaluationResult;
  userImage?: string | null;
}

export const ResultDisplay: React.FC<Props> = ({ result, userImage }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, [result]);

  // Crop the card from the original image using the detected bounding box
  useEffect(() => {
    if (userImage && result.card_bounding_box) {
      const img = new Image();
      img.src = userImage;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const box = result.card_bounding_box;
        
        // Normalize 0-1000 to pixels
        const ymin = (box.ymin / 1000) * img.height;
        const xmin = (box.xmin / 1000) * img.width;
        const ymax = (box.ymax / 1000) * img.height;
        const xmax = (box.xmax / 1000) * img.width;
        
        const width = xmax - xmin;
        const height = ymax - ymin;
        
        // Ensure valid dimensions
        if (width > 0 && height > 0) {
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Draw only the bounding box area
                ctx.drawImage(img, xmin, ymin, width, height, 0, 0, width, height);
                setCroppedImageUrl(canvas.toDataURL());
            }
        }
      };
    } else {
        setCroppedImageUrl(null);
    }
  }, [userImage, result.card_bounding_box]);

  const getVerdictColor = (v: string) => {
    if (v.includes('BUY')) return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]';
    if (v.includes('CONDITIONAL')) return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
    return 'text-red-400 border-red-500/50 bg-red-500/10';
  };

  const getScoreColor = (score: number) => {
    if (score >= 45) return 'text-emerald-400';
    if (score >= 40) return 'text-cyan-400';
    if (score >= 35) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={`space-y-8 pb-12 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* 1. Header & Verdict */}
      <div className={`p-8 bg-slate-900 border-2 rounded-3xl relative overflow-hidden group animate-stamp ${getVerdictColor(result.verdict).split(' ')[1]}`}>
        {/* Background Grain */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="w-48 h-48" />
        </div>

        <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
            {/* Visual Asset Container */}
            <div className="w-full md:w-1/3 aspect-[3/4] rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl relative bg-slate-950 flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                
                {croppedImageUrl ? (
                     <img 
                        src={croppedImageUrl} 
                        className="w-full h-full object-contain p-2 animate-fade-in" 
                        alt="Extracted Card Asset" 
                     />
                ) : (
                    userImage && <img src={userImage} className="w-full h-full object-cover opacity-80" alt="Card" />
                )}
                
                {/* Visual Label */}
                {croppedImageUrl && (
                    <div className="absolute bottom-2 right-2 bg-slate-950/80 text-emerald-400 text-[9px] px-2 py-0.5 rounded border border-emerald-500/30 backdrop-blur-md font-mono uppercase">
                        AI Extracted
                    </div>
                )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 text-slate-400 mb-4 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                    <Target className="w-3 h-3" />
                    <span className="text-xs font-display font-bold uppercase tracking-widest">Investment Grade Analysis</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 italic uppercase tracking-tighter">
                    {result.extracted_details.player}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6 text-slate-400 font-mono text-sm">
                    <span>{result.extracted_details.year} {result.extracted_details.set}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                    <span>{result.extracted_details.grade}</span>
                    {result.extracted_details.detected_price && (
                        <>
                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                            <span className="text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                                {result.extracted_details.detected_price}
                            </span>
                        </>
                    )}
                </div>
                
                <div className="flex items-center justify-center md:justify-start space-x-4 mb-8">
                    <div className={`px-6 py-3 rounded-xl border-2 font-display font-bold text-xl uppercase tracking-widest backdrop-blur-md ${getVerdictColor(result.verdict)}`}>
                        {result.verdict}
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                        <span className={`text-4xl font-black font-display ${getScoreColor(result.total_score)}`}>
                            {result.total_score}<span className="text-lg text-slate-600">/50</span>
                        </span>
                    </div>
                </div>

                <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800">
                    <h4 className="text-slate-500 font-display font-bold text-xs uppercase tracking-[0.2em] mb-3 flex items-center">
                        <Zap className="w-3 h-3 mr-2 text-emerald-500" />
                        Executive Summary
                    </h4>
                    <p className="text-slate-200 text-lg leading-relaxed italic font-light">"{result.explanation}"</p>
                </div>
            </div>
        </div>
      </div>

      {/* 2. Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Scores */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
             <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-3 text-emerald-500" />
                Performance Metrics
             </h3>
             <div className="space-y-1">
                <ScoreBar 
                    label={SCORING_CRITERIA.PLAYER_TIER.label} 
                    score={result.player_tier_score} 
                    max={SCORING_CRITERIA.PLAYER_TIER.max} 
                    reason={result.player_tier_reason}
                    delay={100}
                />
                <ScoreBar 
                    label={SCORING_CRITERIA.RARITY.label} 
                    score={result.rarity_score} 
                    max={SCORING_CRITERIA.RARITY.max} 
                    reason={result.rarity_reason}
                    delay={200}
                />
                <ScoreBar 
                    label={SCORING_CRITERIA.GRADING.label} 
                    score={result.grading_score} 
                    max={SCORING_CRITERIA.GRADING.max} 
                    reason={result.grading_reason}
                    delay={300}
                />
                <ScoreBar 
                    label={SCORING_CRITERIA.ERA.label} 
                    score={result.era_score} 
                    max={SCORING_CRITERIA.ERA.max} 
                    reason={result.era_reason}
                    delay={400}
                />
                <ScoreBar 
                    label={SCORING_CRITERIA.VALUE.label} 
                    score={result.value_efficiency_score} 
                    max={SCORING_CRITERIA.VALUE.max} 
                    reason={result.value_efficiency_reason}
                    delay={500}
                />
                <ScoreBar 
                    label={SCORING_CRITERIA.STRATEGY.label} 
                    score={result.strategy_fit_score} 
                    max={SCORING_CRITERIA.STRATEGY.max} 
                    reason={result.strategy_fit_reason}
                    delay={600}
                />
             </div>
        </div>

        {/* Right Column: Market Intelligence */}
        <div className="space-y-6">
             {/* Set Info */}
             <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-3 text-blue-500" />
                    Set Intelligence
                </h3>
                <div className="space-y-4">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Set Identity</span>
                        <p className="text-sm text-slate-300 leading-relaxed">{result.set_info.general_info}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Key Inserts</span>
                            <p className="text-xs text-slate-300">{result.set_info.key_inserts}</p>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Case Hits</span>
                            <p className="text-xs text-slate-300">{result.set_info.case_hits}</p>
                        </div>
                    </div>
                </div>
             </div>

             {/* Advanced Data */}
             <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-3 text-yellow-500" />
                    Liquidity & Upside
                </h3>
                <div className="flex flex-col gap-4">
                    {/* Liquidity */}
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Liquidity</span>
                            <span className={`text-2xl font-display font-bold ${result.advanced.liquidity === 'High' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                {result.advanced.liquidity}
                            </span>
                        </div>
                        <div className="text-xs text-slate-400 text-right max-w-[60%] leading-relaxed pl-4 border-l border-slate-800/50">
                            {result.advanced.liquidity_reason}
                        </div>
                    </div>

                    {/* Growth */}
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Growth</span>
                            <span className={`text-2xl font-display font-bold ${result.advanced.appreciation_probability === 'High' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                {result.advanced.appreciation_probability}
                            </span>
                        </div>
                         <div className="text-xs text-slate-400 text-right max-w-[60%] leading-relaxed pl-4 border-l border-slate-800/50">
                            {result.advanced.appreciation_reason}
                        </div>
                    </div>

                    {/* Trade Up */}
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Trade Up</span>
                            <span className={`text-2xl font-display font-bold ${result.advanced.trade_up_potential === 'High' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                {result.advanced.trade_up_potential}
                            </span>
                        </div>
                         <div className="text-xs text-slate-400 text-right max-w-[60%] leading-relaxed pl-4 border-l border-slate-800/50">
                            {result.advanced.trade_up_reason}
                        </div>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};