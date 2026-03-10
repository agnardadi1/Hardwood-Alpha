import React from 'react';
import { ComparisonResult, EvaluationResult } from '../types';
import { Trophy, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

interface Props {
  comparison: ComparisonResult;
  results: EvaluationResult[];
}

export const ComparisonView: React.FC<Props> = ({ comparison, results }) => {
  const winner = results[comparison.winner_index];

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-8 mb-12 shadow-2xl relative overflow-hidden animate-fade-in">
        {/* Confetti / Glow effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/40">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">Top Investment Pick</h2>
                    <p className="text-xs text-slate-400 font-mono">AI COMPARATIVE MARKET ANALYSIS</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Winner Card */}
                <div className="md:w-1/3">
                    <div className="bg-slate-900/80 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative">
                         <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            WINNER
                        </div>
                        <h3 className="text-xl font-display font-bold text-white mb-1">{comparison.winner_card_name}</h3>
                        <div className="text-emerald-400 font-bold text-3xl font-display mb-4">
                            Score: {winner?.total_score}
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-emerald-500/30 pl-3">
                            {comparison.winner_reason}
                        </p>
                    </div>
                </div>

                {/* Rankings & Market Context */}
                <div className="flex-1 space-y-6">
                    <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-2 text-blue-400" />
                            Market Analysis
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {comparison.market_analysis}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {comparison.ranking.slice(1).map((rank, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-900/30 p-3 rounded-lg border border-slate-800/50">
                                <div className="flex items-center space-x-3">
                                    <span className="text-slate-500 font-mono text-sm">#{rank.rank}</span>
                                    <span className="text-slate-200 font-bold text-sm">{rank.card_name}</span>
                                </div>
                                <div className="text-xs text-slate-500 max-w-[200px] truncate text-right">
                                    {rank.reason}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};