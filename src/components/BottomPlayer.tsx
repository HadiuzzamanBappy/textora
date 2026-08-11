import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Square, Gauge, Globe, Download, Loader2, ChevronUp } from "lucide-react";
import { cn } from "../utils/cn";
import { SUPPORTED_LANGUAGES } from "../utils/languages";

interface Voice {
  name: string;
  lang: string;
}

interface BottomPlayerProps {
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  encodedProgress?: number;
  sourceText: string;
  isTranslating: boolean;
  isTranslatingChunk: boolean;
  isExporting: boolean;
  translationEnabled: boolean;
  setTranslationEnabled: (enabled: boolean) => void;
  targetLang: string;
  setTargetLang: (lang: string) => void;
  setVoiceLang: (lang: string) => void;
  voiceLang: string;
  voiceLanguages: string[];
  filteredVoices: Voice[];
  selectedVoice: Voice | null;
  handleVoiceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  speechRate: number;
  handleRateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePlay: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  onOpenExportModal: () => void;
}

export function BottomPlayer({
  isPlaying,
  isPaused,
  progress,
  encodedProgress,
  sourceText,
  isTranslating,
  isTranslatingChunk,
  isExporting,
  translationEnabled,
  setTranslationEnabled,
  targetLang,
  setTargetLang,
  setVoiceLang,
  voiceLanguages,
  filteredVoices,
  selectedVoice,
  handleVoiceChange,
  speechRate,
  handleRateChange,
  handlePlay,
  pause,
  resume,
  stop,
  onOpenExportModal,
}: BottomPlayerProps) {

  // Filter supported languages to only show ones that the user's browser has a voice for
  const playableLanguages = voiceLanguages.length > 0
    ? SUPPORTED_LANGUAGES.filter((lang) => {
      const primaryCode = lang.code.split("-")[0].toLowerCase();
      return voiceLanguages.includes(primaryCode);
    })
    : SUPPORTED_LANGUAGES;

  const [showSpeed, setShowSpeed] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  
  const speedRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const voiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const node = event.target as Node;
      if (speedRef.current && !speedRef.current.contains(node)) setShowSpeed(false);
      if (langRef.current && !langRef.current.contains(node)) setShowLang(false);
      if (voiceRef.current && !voiceRef.current.contains(node)) setShowVoice(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 w-full z-40 px-4 pb-4 pointer-events-none">
      <div className="max-w-4xl mx-auto w-full pointer-events-auto transition-transform duration-500 transform translate-y-0">

        {/* Progress Bar (Attached to top of player) */}
        {(isPlaying || progress > 0 || isTranslatingChunk) && (
          <div className="w-full bg-[var(--bg-input)] h-1.5 rounded-t-xl overflow-hidden mx-auto shadow-[0_-4px_10px_rgba(0,0,0,0.1)] relative z-0 opacity-90">
            {/* Encoded Progress Background */}
            {encodedProgress !== undefined && encodedProgress > 0 && (
              <div 
                className="absolute top-0 left-0 h-full bg-rose-500/20 transition-all duration-300 ease-out"
                style={{ width: `${encodedProgress}%` }}
              />
            )}
            
            {/* Spoken Progress */}
            <div
              className={cn(
                "h-full transition-all duration-300 ease-out relative z-10",
                progress === 100 ? "bg-rose-500" : "bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500 bg-[length:200%_100%] animate-[gradient_2s_linear_infinite]"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className={cn(
          "bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-card)] p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-500",
          (isPlaying || progress > 0 || isTranslatingChunk) ? "rounded-b-2xl rounded-t-none border-t-0" : "rounded-2xl"
        )}>

          {/* Left: Translation Controls */}
          <div className="flex items-center justify-center md:justify-start gap-3 w-full md:w-1/3">
            <label className={cn("flex items-center gap-2 group", (isPlaying || isTranslating) ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={translationEnabled}
                  onChange={(e) => setTranslationEnabled(e.target.checked)}
                  disabled={isPlaying || isTranslating}
                />
                <div className={cn(
                  "block w-10 h-6 rounded-full transition-colors duration-300",
                  translationEnabled ? "bg-rose-500" : "bg-[var(--bg-input)] border border-[var(--border-input)]"
                )}></div>
                <div className={cn(
                  "dot absolute left-1 top-1 w-4 h-4 rounded-full transition-all duration-300 shadow-sm",
                  translationEnabled ? "transform translate-x-4 bg-white" : "bg-[var(--text-muted)]"
                )}></div>
              </div>
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider transition-colors",
                translationEnabled ? "text-rose-400" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
              )}>
                Translate
              </span>
            </label>

            {translationEnabled && (
              <div 
                className="relative flex-1 animate-in slide-in-from-left-4 fade-in duration-300 max-w-[180px] flex items-center"
                ref={langRef}
                onMouseEnter={() => {
                  if (!isPlaying && !isTranslating) setShowLang(true);
                }}
                onMouseLeave={() => setShowLang(false)}
              >
                <button
                  onClick={() => {
                    if (!isPlaying && !isTranslating) setShowLang(!showLang);
                  }}
                  disabled={isPlaying || isTranslating}
                  className="flex items-center justify-between w-full gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:border-rose-500/40 transition-all text-xs font-medium cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">{playableLanguages.find(l => l.code === targetLang)?.name || targetLang}</span>
                  <Globe className="w-3.5 h-3.5 opacity-80 shrink-0" />
                </button>

                {/* Flyout menu */}
                <div className={cn(
                  "absolute bottom-full left-0 pb-2 opacity-0 translate-y-2 pointer-events-none transition-all duration-200 z-50 w-48", 
                  (!(isPlaying || isTranslating) && showLang) && "opacity-100 translate-y-0 pointer-events-auto"
                )}>
                  <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl shadow-xl overflow-y-auto max-h-60 flex flex-col custom-scrollbar scroll-smooth">
                    {playableLanguages.map((lang) => (
                      <button
                        key={`target-${lang.code}`}
                        onClick={() => {
                          setTargetLang(lang.code);
                          setVoiceLang(lang.code);
                        }}
                        className={cn(
                          "flex items-center w-full px-4 py-2.5 text-xs font-medium text-left transition-colors",
                          targetLang === lang.code
                            ? "bg-rose-500 text-white hover:bg-rose-600"
                            : "text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
                        )}
                        title={lang.name}
                      >
                        <span className="truncate w-full">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center justify-center gap-4 w-full md:w-1/3">
            {(!isPlaying && !isPaused) ? (
              <button
                onClick={handlePlay}
                disabled={!sourceText.trim() || isTranslating}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-orange-600 hover:from-rose-400 hover:to-orange-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              >
                <Play className="w-6 h-6 ml-1" fill="currentColor" />
              </button>
            ) : (
              <>
                <button
                  onClick={stop}
                  className="p-3 rounded-full bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-secondary)] hover:text-rose-400 hover:border-rose-500/30 transition-all hover:scale-105"
                >
                  <Square className="w-5 h-5" fill="currentColor" />
                </button>

                {isPlaying && !isPaused ? (
                  <button
                    onClick={pause}
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105 active:scale-95"
                  >
                    <Pause className="w-6 h-6" fill="currentColor" />
                  </button>
                ) : (
                  <button
                    onClick={resume}
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-400 text-rose-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all transform hover:scale-105 active:scale-95"
                  >
                    <Play className="w-6 h-6 ml-1" fill="currentColor" />
                  </button>
                )}

                {/* Visualizer when playing */}
                <div className="w-10 h-6 flex items-center gap-0.5 justify-center ml-2">
                  {(isPlaying && !isPaused) ? (
                    <>
                      <span className="w-1 h-3 bg-rose-400 rounded-full animate-[bounce_0.6s_infinite_100ms]" />
                      <span className="w-1 h-6 bg-orange-400 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
                      <span className="w-1 h-4 bg-rose-400 rounded-full animate-[bounce_0.6s_infinite_150ms]" />
                    </>
                  ) : (
                    <>
                      <span className="w-1 h-1 bg-[var(--border-input)] rounded-full" />
                      <span className="w-1 h-1 bg-[var(--border-input)] rounded-full" />
                      <span className="w-1 h-1 bg-[var(--border-input)] rounded-full" />
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right: Voice Settings & Export */}
          <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-1/3">

            {/* Speed Control */}
            <div 
              className={cn("flex items-center gap-2 relative", (isPlaying || isTranslating) ? "opacity-50 cursor-not-allowed" : "cursor-pointer")} 
              ref={speedRef}
              onMouseEnter={() => {
                if (!isPlaying && !isTranslating) setShowSpeed(true);
              }}
              onMouseLeave={() => setShowSpeed(false)}
            >
              <button
                onClick={() => {
                  if (!isPlaying && !isTranslating) setShowSpeed(!showSpeed);
                }}
                disabled={isPlaying || isTranslating}
                className={cn(
                  "p-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-secondary)] hover:text-rose-400 transition-colors",
                  showSpeed && "text-rose-400 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                )}
              >
                <Gauge className="w-4 h-4" />
              </button>
              {/* Flyout slider */}
              <div className={cn(
                "absolute bottom-full left-1/2 -translate-x-1/2 pb-3 opacity-0 translate-y-2 pointer-events-none transition-all duration-300 w-32 z-50", 
                (!(isPlaying || isTranslating) && showSpeed) && "opacity-100 translate-y-0 pointer-events-auto"
              )}>
                <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl p-3 shadow-xl">
                  <div className="text-center text-[10px] font-bold text-rose-400 mb-2">{speechRate.toFixed(1)}x Speed</div>
                  <input type="range" min="0.5" max="2.0" step="0.1" value={speechRate} onChange={handleRateChange} className="w-full h-1.5 bg-rose-500/20 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                </div>
              </div>
            </div>

            {/* Voice Selection */}
            <div 
              className="relative flex-1 max-w-[180px] flex items-center"
              ref={voiceRef}
              onMouseEnter={() => {
                if (filteredVoices.length > 0 && !isPlaying && !isTranslating) setShowVoice(true);
              }}
              onMouseLeave={() => setShowVoice(false)}
            >
              <button
                onClick={() => {
                  if (filteredVoices.length > 0 && !isPlaying && !isTranslating) setShowVoice(!showVoice);
                }}
                disabled={filteredVoices.length === 0 || isPlaying || isTranslating}
                className="flex items-center justify-between w-full gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:border-rose-500/40 transition-all text-xs font-medium cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="truncate">{selectedVoice?.name || "No voices found"}</span>
                <ChevronUp className="w-3.5 h-3.5 opacity-80 shrink-0" />
              </button>

              {/* Flyout menu */}
              {(filteredVoices.length > 0 && !isPlaying && !isTranslating) && (
                <div className={cn(
                  "absolute bottom-full right-0 pb-2 opacity-0 translate-y-2 pointer-events-none transition-all duration-200 z-50 w-64",
                  showVoice && "opacity-100 translate-y-0 pointer-events-auto"
                )}>
                  <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl shadow-xl overflow-y-auto max-h-60 flex flex-col custom-scrollbar scroll-smooth">
                    {filteredVoices.map((voice) => (
                      <button
                        key={voice.name}
                        onClick={() => handleVoiceChange({ target: { value: voice.name } } as React.ChangeEvent<HTMLSelectElement>)}
                        className={cn(
                          "flex items-center w-full px-4 py-2.5 text-xs font-medium text-left transition-colors",
                          selectedVoice?.name === voice.name
                            ? "bg-rose-500 text-white hover:bg-rose-600"
                            : "text-[var(--text-primary)] hover:bg-[var(--bg-input)]"
                        )}
                        title={voice.name}
                      >
                        <span className="truncate w-full">{voice.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Export MP3/WAV Button */}
            <div className="relative flex items-center">
              <button
                onClick={onOpenExportModal}
                disabled={isPlaying || isTranslating || isExporting || !sourceText.trim()}
                title="Export Audio"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-input)] bg-rose-500 text-white hover:bg-rose-600 transition-all text-xs font-medium cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export"}</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
