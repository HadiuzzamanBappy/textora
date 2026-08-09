import React from "react";
import { Trash2, Type, Languages, ChevronDown, ChevronUp } from "lucide-react";

interface DocumentReaderProps {
  sourceText: string;
  setSourceText: (text: string) => void;
  translatedText?: string;
  isPlaying: boolean;
  isTranslating: boolean;
  handleClear: () => void;
  showTranscript: boolean;
  setShowTranscript: (show: boolean) => void;
  translationEnabled: boolean;
}

export function DocumentReader({
  sourceText,
  setSourceText,
  translatedText,
  isPlaying,
  isTranslating,
  handleClear,
  showTranscript,
  setShowTranscript,
  translationEnabled,
}: DocumentReaderProps) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 relative z-10 transition-all duration-500">
      
      {/* Main Document Input */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-500" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-md shadow-sm">
              <Type className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
              Document
            </span>
          </div>
          
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-transparent text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all text-xs font-medium cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        <textarea
          aria-label="Document Text"
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          disabled={isPlaying || isTranslating}
          className="w-full flex-1 min-h-[40vh] bg-transparent border-none p-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-0 resize-none text-lg leading-relaxed disabled:opacity-60 relative z-10 custom-scrollbar font-serif"
          placeholder="Paste your text here to begin reading..."
        />

        <div className="flex items-center justify-end border-t border-[var(--border-input)] pt-3 relative z-10">
          <span className="text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-input)] px-2.5 py-1 rounded-md border border-[var(--border-input)] shadow-sm">
            {sourceText.length.toLocaleString()} chars
          </span>
        </div>
      </div>

      {/* Optional Transcript view if translation is enabled */}
      {translationEnabled && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 backdrop-blur-sm shadow-md flex flex-col gap-4 relative overflow-hidden transition-all duration-300">
          <button 
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center justify-between w-full focus:outline-none group/btn"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-md shadow-sm">
                <Languages className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)] group-hover/btn:text-[var(--text-primary)] transition-colors">
                Live Translation Transcript
              </span>
            </div>
            <div className="text-[var(--text-secondary)] group-hover/btn:text-[var(--text-primary)] p-1 rounded-full bg-[var(--bg-input)] border border-[var(--border-input)] transition-all">
              {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showTranscript && (
            <div className="mt-2 pt-4 border-t border-[var(--border-input)] animate-in slide-in-from-top-4 fade-in duration-300">
              <textarea
                readOnly
                value={translatedText || ""}
                className="w-full min-h-[20vh] bg-transparent border-none text-[var(--text-primary)] text-base leading-relaxed resize-none focus:outline-none custom-scrollbar italic opacity-90"
                placeholder="The translated text will appear here as it is being processed..."
              />
            </div>
          )}
        </div>
      )}
      
      {/* Bottom spacer for the fixed player */}
      <div className="h-32" aria-hidden="true" />
    </div>
  );
}
