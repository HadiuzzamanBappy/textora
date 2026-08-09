import React from "react";
import { Settings, X, Globe, Mic, AlignLeft, Check } from "lucide-react";
import { cn } from "../utils/cn";

interface Voice {
  name: string;
  lang: string;
}

interface SettingsOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  translationProvider: "browser" | "google";
  setTranslationProvider: (provider: "browser" | "google") => void;
  voiceLang: string;
  setVoiceLang: (lang: string) => void;
  voiceLanguages: string[];
  getLanguageName: (code: string) => string;
  filteredVoices: Voice[];
  selectedVoice: Voice | null;
  handleVoiceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  speechRate: number;
  handleRateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxChunkSize: number;
  handleChunkSizeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPlaying: boolean;
  isTranslating: boolean;
}

export function SettingsOffcanvas({
  isOpen,
  onClose,
  translationProvider,
  setTranslationProvider,
  maxChunkSize,
  handleChunkSizeChange,
  isPlaying,
  isTranslating,
}: SettingsOffcanvasProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        aria-label="Settings Panel"
        className={cn(
          "fixed top-0 right-0 z-[70] h-full w-full sm:w-[420px] bg-[var(--bg-card)] border-l border-[var(--border-card)] shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-input)] shrink-0 bg-[var(--bg-header)]/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Settings className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-base font-bold tracking-wide text-[var(--text-primary)]">Advanced Settings</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Settings"
            className="p-2 rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-thin scrollbar-thumb-[var(--border-input)] scrollbar-track-transparent">
          
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
            <p className="text-xs text-indigo-300/80 leading-relaxed">
              These settings control the underlying engine. Voice selection and speed can now be found on the main player bar at the bottom of your screen.
            </p>
          </div>

          {/* Translation Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-input)]">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold tracking-widest text-[var(--text-secondary)] uppercase">Translation Engine</span>
            </div>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="s-provider-select" className="text-sm font-medium text-[var(--text-primary)]">Translation Method</label>
              <div className="relative">
                <select
                  id="s-provider-select"
                  value={translationProvider}
                  onChange={(e) => setTranslationProvider(e.target.value as "browser" | "google")}
                  disabled={isPlaying || isTranslating}
                  className="w-full appearance-none bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                >
                  <option value="browser">Free Web Translator (Keyless)</option>
                  <option value="google">Google Cloud API (Requires Key)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[var(--text-secondary)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </section>

          {/* Engine Parameters Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border-input)]">
              <Mic className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold tracking-widest text-[var(--text-secondary)] uppercase">Engine Parameters</span>
            </div>

            {/* Text Segmentation Slider */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-[var(--text-secondary)]" />
                  <label htmlFor="s-chunk-size" className="text-sm font-medium text-[var(--text-primary)]">Segmentation Size</label>
                </div>
                <span className="text-sm font-bold text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">{maxChunkSize}</span>
              </div>
              <input id="s-chunk-size" type="range" min="50" max="500" step="25" value={maxChunkSize} onChange={handleChunkSizeChange} className="w-full h-2 bg-[var(--bg-input)] rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all" />
              <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-mono">
                <span>50 ch</span><span>500 ch</span>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-[var(--border-input)] shrink-0 bg-[var(--bg-header)]/50 backdrop-blur-md">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4.5 h-4.5" />
            Save Preferences
          </button>
        </div>
      </aside>
    </>
  );
}
