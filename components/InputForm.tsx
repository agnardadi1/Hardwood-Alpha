import React, { useState, useRef, useEffect } from 'react';
import { CardInput } from '../types';
import { Upload, Loader2, Image as ImageIcon, X, FileText, ScanLine, Layers, Trash2 } from 'lucide-react';

interface Props {
  onEvaluate: (inputs: CardInput[]) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<Props> = ({ onEvaluate, isLoading }) => {
  const [images, setImages] = useState<{ id: string, url: string, file: File }[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[]) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
            setImages(prev => {
                // Prevent duplicates based on simple name match (not perfect but helpful)
                if (prev.some(img => img.file.name === file.name && img.file.size === file.size)) return prev;
                return [...prev, {
                    id: Math.random().toString(36).substr(2, 9),
                    url: e.target?.result as string,
                    file
                }];
            });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) files.push(blob);
          }
        }
        if (files.length > 0) {
            if (isBatchMode) {
                handleFiles(files);
            } else {
                setImages([]);
                handleFiles([files[0]]);
            }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isBatchMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (isBatchMode) {
        handleFiles(e.target.files);
      } else {
        // Single mode replace
        setImages([]);
        handleFiles([e.target.files[0]]);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        if (isBatchMode) {
            handleFiles(e.dataTransfer.files);
        } else {
            setImages([]);
            handleFiles([e.dataTransfer.files[0]]);
        }
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const clearAll = () => {
    setImages([]);
    setAdditionalInfo('');
  };

  const toggleMode = () => {
    setIsBatchMode(prev => !prev);
    setImages([]); // Clear images when switching modes to avoid confusion
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return;
    
    const inputs: CardInput[] = images.map(img => ({
        id: img.id,
        image: img.url,
        additionalInfo: additionalInfo // Apply same context to all for now
    }));
    
    onEvaluate(inputs);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden group/form transition-all duration-300">
      {/* Visual Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500/30 rounded-tl-lg"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500/30 rounded-tr-lg"></div>

      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest flex items-center">
            <ScanLine className="w-3 h-3 mr-2 text-emerald-500" />
            {isBatchMode ? 'Batch Analysis' : 'Single Asset Scan'}
        </h3>
        
        {/* Toggle Switch */}
        <div 
            className="flex items-center space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800 cursor-pointer"
            onClick={toggleMode}
        >
            <div className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${!isBatchMode ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}>SINGLE</div>
            <div className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${isBatchMode ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'}`}>BATCH</div>
        </div>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 min-h-[280px] flex flex-col items-center justify-center
          ${isDragging ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {images.length > 0 ? (
          <div className={`w-full h-full p-2 ${isBatchMode ? 'grid grid-cols-2 gap-4' : 'flex items-center justify-center'}`}>
            {images.map((img) => (
                <div key={img.id} className="relative group/image">
                    <img 
                        src={img.url} 
                        alt="Preview" 
                        className={`object-contain rounded-lg shadow-2xl border border-slate-700 bg-slate-900 ${isBatchMode ? 'h-32 w-full' : 'max-h-[260px] w-auto'}`}
                    />
                    <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 bg-red-500/80 text-white p-1.5 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-red-600"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ))}
            
            {isBatchMode && (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-32 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900 transition-colors"
                >
                    <Upload className="w-6 h-6 text-slate-600 mb-2" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Add More</span>
                </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 cursor-pointer py-10" onClick={() => fileInputRef.current?.click()}>
            <div className="w-16 h-16 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shadow-inner group-hover/form:scale-110 transition-transform duration-300">
                {isBatchMode ? <Layers className="w-8 h-8 text-slate-500 group-hover/form:text-emerald-500 transition-colors" /> : <Upload className="w-8 h-8 text-slate-500 group-hover/form:text-emerald-500 transition-colors" />}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-300 uppercase tracking-wide">
                    {isBatchMode ? 'Upload Multiple Cards' : 'Click to Upload'}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                    {isBatchMode ? 'Drag & drop a stack (Ctrl+V)' : 'or drag and drop (Ctrl+V)'}
                </p>
            </div>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple={isBatchMode}
          onChange={handleFileChange}
        />
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
             <label className="flex items-center text-xs font-display font-bold text-slate-400 uppercase tracking-widest">
                <FileText className="w-3 h-3 mr-2 text-emerald-500" />
                Buyer Context {isBatchMode && '(Applied to all)'}
            </label>
            {images.length > 0 && (
                <button type="button" onClick={clearAll} className="text-[10px] text-red-400 hover:text-red-300 flex items-center">
                    <Trash2 className="w-3 h-3 mr-1" /> Clear
                </button>
            )}
        </div>
       
        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder={isBatchMode ? "Any specific notes for this batch?" : "Seller asking price? Condition concerns?"}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-300 text-sm focus:border-emerald-500/50 focus:ring-1 outline-none transition-all resize-none"
          rows={2}
        />
      </div>

      <div className="mt-8">
        <button
          type="submit"
          disabled={images.length === 0 || isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group/btn"
        >
          <div className="py-4 flex items-center justify-center space-x-3">
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (isBatchMode ? <Layers className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />)}
            <span className="font-display font-bold tracking-widest text-lg group-hover/btn:tracking-[0.15em] transition-all">
                {isLoading 
                    ? `ANALYZING ${isBatchMode ? 'BATCH' : 'ASSET'}...` 
                    : `INITIATE ${isBatchMode ? 'BATCH ' : ''}ANALYSIS`
                }
            </span>
          </div>
        </button>
      </div>
    </form>
  );
};