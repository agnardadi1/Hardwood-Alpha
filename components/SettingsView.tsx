import React from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../types';
import { Save, RotateCcw, AlertCircle, Sliders } from 'lucide-react';

interface Props {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsView: React.FC<Props> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState<AppSettings>(settings);
  const [hasChanges, setHasChanges] = React.useState(false);

  const handleChange = (section: keyof AppSettings, key: string | null, value: any) => {
    setLocalSettings(prev => {
        if (key && typeof prev[section] === 'object') {
            return {
                ...prev,
                [section]: {
                    ...(prev[section] as object),
                    [key]: value
                }
            };
        }
        return {
            ...prev,
            [section]: value
        };
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-fade-in relative overflow-hidden">
        {/* Decorative header line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500"></div>

        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6 mt-2">
            <div>
                <h2 className="text-3xl font-display font-bold text-white tracking-wide uppercase">System Protocols</h2>
                <div className="flex items-center text-xs text-slate-500 font-mono mt-1">
                    <Sliders className="w-3 h-3 mr-2" />
                    CONFIGURE EVALUATION PARAMETERS
                </div>
            </div>
            <div className="flex space-x-3">
                <button 
                    onClick={handleReset}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 text-xs font-display font-bold tracking-wider transition-colors"
                >
                    <RotateCcw className="w-3 h-3" />
                    <span>RESET DEFAULTS</span>
                </button>
                <button 
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-display font-bold text-sm tracking-wider transition-all ${
                        hasChanges 
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-900/50' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                    <Save className="w-4 h-4" />
                    <span>SAVE CONFIG</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Column 1: Strategy & Rubric */}
            <div className="space-y-6">
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner">
                    <h3 className="text-emerald-500 font-display font-bold text-sm uppercase tracking-widest mb-6 flex items-center">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        Core Strategy
                    </h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-slate-400 text-xs font-display font-bold tracking-wider mb-2">BUDGET RANGE ($)</label>
                            <div className="flex items-center space-x-3">
                                <div className="relative w-full">
                                    <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono">$</span>
                                    <input 
                                        type="number" 
                                        value={localSettings.budgetMin}
                                        onChange={(e) => handleChange('budgetMin', null, parseInt(e.target.value) || 0)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-6 pr-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                                    />
                                </div>
                                <span className="text-slate-600 font-mono">-</span>
                                <div className="relative w-full">
                                    <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono">$</span>
                                    <input 
                                        type="number" 
                                        value={localSettings.budgetMax}
                                        onChange={(e) => handleChange('budgetMax', null, parseInt(e.target.value) || 0)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-6 pr-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs font-display font-bold tracking-wider mb-2">STRATEGY MANIFESTO</label>
                            <textarea 
                                rows={5}
                                value={localSettings.strategyText}
                                onChange={(e) => handleChange('strategyText', null, e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors leading-relaxed font-sans"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner">
                    <h3 className="text-blue-500 font-display font-bold text-sm uppercase tracking-widest mb-6 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                        Scoring Rubric Logic
                    </h3>
                    
                    <div className="space-y-5">
                        {[
                            { k: 'rarity', label: 'RARITY (0-10)' },
                            { k: 'grading', label: 'GRADING (0-11)' },
                            { k: 'era', label: 'ERA & SET (0-5)' },
                            { k: 'value', label: 'VALUE (0-10)' },
                        ].map((field) => (
                            <div key={field.k}>
                                <label className="block text-slate-400 text-xs font-display font-bold tracking-wider mb-2">{field.label}</label>
                                <textarea 
                                    rows={2}
                                    value={localSettings.rubric[field.k as keyof typeof localSettings.rubric]}
                                    onChange={(e) => handleChange('rubric', field.k, e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 focus:border-blue-500 focus:outline-none transition-colors leading-relaxed font-sans"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Column 2: Player Tiers */}
            <div className="space-y-6">
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 h-full shadow-inner">
                    <h3 className="text-purple-500 font-display font-bold text-sm uppercase tracking-widest mb-6 flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
                        Player Database / Tiers
                    </h3>
                    <p className="text-[10px] text-slate-400 mb-6 bg-slate-900 p-3 rounded-lg border border-slate-800/50">
                        Define specific players or criteria for the top tiers. The AI will use these lists to determine the "Player Tier" score.
                    </p>
                    
                    <div className="space-y-6">
                        {[
                            { k: 'tier10', label: 'TIER 10: GOAT / GOD TIER', color: 'text-purple-400' },
                            { k: 'tier9', label: 'TIER 9: INNER CIRCLE', color: 'text-purple-300' },
                            { k: 'tier8', label: 'TIER 8: LOCK HOF', color: 'text-slate-200' },
                            { k: 'tier7', label: 'TIER 7: MULTI-ALL STAR', color: 'text-slate-300' },
                            { k: 'tier6', label: 'TIER 6: LOWER DEMAND HOF', color: 'text-slate-400' },
                        ].map((tier) => (
                            <div key={tier.k}>
                                <label className={`block ${tier.color} font-display font-bold text-xs tracking-wider mb-2`}>{tier.label}</label>
                                <textarea 
                                    rows={3}
                                    value={localSettings.tiers[tier.k as keyof typeof localSettings.tiers]}
                                    onChange={(e) => handleChange('tiers', tier.k, e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors font-sans"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
        {hasChanges && (
            <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center animate-bounce cursor-pointer z-50 border border-emerald-400/30" onClick={handleSave}>
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="font-display font-bold text-sm tracking-wider">UNSAVED CHANGES DETECTED</span>
            </div>
        )}
    </div>
  );
};