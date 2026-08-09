import React from "react";
import { Loader2, Trash2, Languages, Type } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../utils/languages";

interface SourcePanelProps {
  sourceText: string;
  setSourceText: (text: string) => void;
  sourceLang: string;
  setSourceLang: (lang: string) => void;
  isPlaying: boolean;
  isTranslating: boolean;
  handleClear: () => void;
  handleTranslate: () => void;
}

export function SourcePanel({
  sourceText,
  setSourceText,
  sourceLang,
  setSourceLang,
  isPlaying,
  isTranslating,
  handleClear,
  handleTranslate,
}: SourcePanelProps) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 backdrop-blur-sm flex flex-col gap-4 shadow-xl transition-all duration-300 hover:shadow-indigo-500/5 group relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-500" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-md shadow-sm">
            <Type className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Source Document
          </span>
        </div>
        
        <div className="relative group/select">
          <select
            aria-label="Source Language Selector"
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            disabled={isPlaying || isTranslating}
            className="appearance-none bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-secondary)] text-xs font-medium rounded-xl pl-8 pr-8 py-2 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 cursor-pointer disabled:opacity-50 transition-all shadow-sm hover:border-indigo-500/40"
          >
            <option value="auto">Detect Language</option>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={`source-${lang.code}`} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-indigo-400">
            <Languages className="w-4 h-4" />
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-[var(--text-secondary)] group-hover/select:text-[var(--text-primary)] transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <textarea
        aria-label="Source Text Input"
        value={sourceText}
        onChange={(e) => setSourceText(e.target.value)}
        disabled={isPlaying || isTranslating}
        className="w-full flex-1 min-h-[240px] bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl p-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none text-sm leading-relaxed disabled:opacity-60 shadow-inner relative z-10 custom-scrollbar"
        placeholder="Type or paste your text here..."
      />

      <div className="flex items-center justify-between border-t border-[var(--border-input)] pt-4 mt-1 relative z-10">
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-transparent text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all text-xs font-medium cursor-pointer group"
        >
          <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          Clear All
        </button>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-input)] px-2 py-1 rounded-md border border-[var(--border-input)] shadow-sm">
            {sourceText.length.toLocaleString()} chars
          </span>
          
          <button
            onClick={handleTranslate}
            disabled={isTranslating || !sourceText.trim() || isPlaying}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-[var(--bg-input)] hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/30 text-[var(--text-primary)] transition-all duration-200 text-xs border border-[var(--border-input)] shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                Translating...
              </>
            ) : (
              "Translate Text Only"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
