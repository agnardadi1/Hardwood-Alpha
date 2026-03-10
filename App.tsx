import React, { useState, useEffect, useRef } from 'react';
import { InputForm } from './components/InputForm';
import { ResultDisplay } from './components/ResultDisplay';
import { SettingsView } from './components/SettingsView';
import { ChatInterface } from './components/ChatInterface';
import { ComparisonView } from './components/ComparisonView';
import { Logo } from './components/Logo';
import { evaluateCard, compareCards } from './services/geminiService';
import { CardInput, EvaluationResult, AppSettings, DEFAULT_SETTINGS, ComparisonResult } from './types';
import { AlertCircle, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ input: CardInput, result: EvaluationResult }[]>([]);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  
  const [view, setView] = useState<'scanner' | 'settings'>(() => {
    const saved = localStorage.getItem('ha_view');
    return (saved === 'settings' || saved === 'scanner') ? saved : 'scanner';
  });
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('ha_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('ha_view', view);
    localStorage.setItem('ha_settings', JSON.stringify(settings));
  }, [view, settings]);

  useEffect(() => {
    if (results.length > 0 && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results, comparison]);

  const handleEvaluate = async (inputs: CardInput[]) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setComparison(null);
    
    try {
      const newResults: { input: CardInput, result: EvaluationResult }[] = [];
      
      // Process cards sequentially to avoid rate limits and update UI progressively if we wanted to (currently just blocked)
      // Actually, let's process them all then update state to keep it simple, 
      // or we could use Promise.all but standard Gemini rate limits might hit.
      // Sequential is safer.
      
      const evaluationData: EvaluationResult[] = [];

      for (const input of inputs) {
        const evaluation = await evaluateCard(input, settings);
        evaluationData.push(evaluation);
        newResults.push({ input, result: evaluation });
      }
      
      setResults(newResults);

      // If we have multiple cards, run comparison
      if (newResults.length > 1) {
          try {
            const comp = await compareCards(evaluationData, settings);
            setComparison(comp);
          } catch (e) {
            console.error("Comparison failed", e);
            // Don't fail the whole flow if comparison fails
          }
      }

    } catch (err) {
      console.error(err);
      setError("Failed to evaluate card(s). Please check your network and API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-12 selection:bg-emerald-500/30 font-sans">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-[#020617]/90 backdrop-blur-md sticky top-0 z-50 shadow-2xl shadow-black/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setView('scanner')}>
                <div className="w-12 h-12 bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-lg shadow-emerald-900/10 transition-all duration-300 group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20">
                    <Logo className="w-full h-full" />
                </div>
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight text-white leading-none">
                        HARDWOOD<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">ALPHA</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-mono font-bold mt-1 group-hover:text-emerald-500/70 transition-colors">
                        Market Intelligence
                    </p>
                </div>
            </div>
            
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => setView('scanner')}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-display font-bold tracking-wider transition-all duration-300 ${view === 'scanner' ? 'bg-slate-800 text-emerald-400 shadow-inner border border-slate-700' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">SCANNER</span>
                </button>
                <button 
                    onClick={() => setView('settings')}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-display font-bold tracking-wider transition-all duration-300 ${view === 'settings' ? 'bg-slate-800 text-emerald-400 shadow-inner border border-slate-700' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">SETTINGS</span>
                </button>
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {view === 'settings' ? (
            <SettingsView settings={settings} onSave={handleSaveSettings} />
        ) : (
            <>
                {error && (
                    <div className="mb-6 p-4 bg-red-950/20 border border-red-500/30 text-red-200 rounded-lg flex items-center animate-pulse backdrop-blur-sm">
                        <AlertCircle className="w-5 h-5 mr-3" />
                        <span className="font-mono text-sm">{error}</span>
                    </div>
                )}

                {/* Using flex-col on mobile to force standard document flow */}
                <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8">
                    
                    {/* Input Section */}
                    <div className="lg:col-span-5 xl:col-span-4 mb-12 lg:mb-0">
                        <div className="lg:sticky lg:top-28 z-10">
                            <InputForm onEvaluate={handleEvaluate} isLoading={loading} />
                            
                            <div className="mt-8 px-4 py-6 border-t border-slate-800/50 bg-slate-900/20 rounded-b-xl backdrop-blur-sm">
                                <h4 className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                                    Active Parameters
                                </h4>
                                <div className="space-y-3 font-mono text-xs text-slate-500">
                                <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                                        <span>STRATEGY</span>
                                        <span className="text-emerald-500 truncate max-w-[150px] text-right bg-emerald-500/10 px-2 py-0.5 rounded">CUSTOM</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                                        <span>BUDGET</span>
                                        <span className="text-slate-300">${settings.budgetMin} - ${settings.budgetMax}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                        <span>TIER 10</span>
                                        <span className="text-slate-300 truncate max-w-[150px] text-right">{settings.tiers.tier10.split('(')[0]}</span>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Output Section */}
                    <div ref={resultRef} className="lg:col-span-7 xl:col-span-8 min-h-[500px] mt-8 lg:mt-0">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-8 text-slate-500 opacity-80 py-20 bg-slate-900/20 rounded-3xl border border-slate-800/50">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                                    <div className="w-20 h-20 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin relative z-10"></div>
                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                        <Logo className="w-10 h-10 text-emerald-500/80" />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="font-display font-bold text-xl text-white tracking-widest uppercase animate-pulse">Analyzing Visual Data</p>
                                    <p className="font-mono text-xs text-slate-500">Extracting: Set, Year, Condition, Market Data</p>
                                </div>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="pt-8 lg:pt-0 animate-fade-in space-y-16">
                                
                                {comparison && (
                                    <ComparisonView 
                                        comparison={comparison} 
                                        results={results.map(r => r.result)} 
                                    />
                                )}

                                {results.map((item, index) => (
                                    <div key={index} className="relative">
                                        {/* Divider if multiple */}
                                        {index > 0 && (
                                            <div className="flex items-center justify-center my-12 opacity-50">
                                                <div className="h-px bg-slate-800 w-full"></div>
                                                <span className="mx-4 text-slate-600 font-mono text-xs">ASSET {index + 1}</span>
                                                <div className="h-px bg-slate-800 w-full"></div>
                                            </div>
                                        )}
                                        
                                        <ResultDisplay 
                                            result={item.result} 
                                            userImage={item.input.image}
                                        />
                                        
                                        <ChatInterface 
                                            input={item.input} 
                                            result={item.result} 
                                            settings={settings} 
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/10 p-12 text-center group transition-all duration-500 hover:border-slate-700 hover:bg-slate-900/30">
                                <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_-10px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_60px_-10px_rgba(16,185,129,0.2)] transition-shadow p-6 border border-slate-800 group-hover:border-emerald-500/30">
                                    <Logo className="w-full h-full opacity-50 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="text-3xl font-display font-bold text-slate-300 mb-3 uppercase tracking-wide group-hover:text-white transition-colors">Initialize Scan</h3>
                                <p className="text-slate-500 max-w-sm text-sm leading-relaxed font-light">
                                    Upload listing photos or screenshots to begin analysis. <br/>
                                    <span className="text-emerald-500/50 text-xs mt-2 block font-mono">AI-POWERED MARKET VALUATION</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </>
        )}
      </main>
    </div>
  );
};

export default App;