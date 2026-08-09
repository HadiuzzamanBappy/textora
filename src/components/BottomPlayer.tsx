import React from "react";
import { Play, Pause, Square, Volume2, Globe, Settings2 } from "lucide-react";
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
  sourceText: string;
  isTranslating: boolean;
  isTranslatingChunk: boolean;
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
}

export function BottomPlayer({
  isPlaying,
  isPaused,
  progress,
  sourceText,
  isTranslating,
  isTranslatingChunk,
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
}: BottomPlayerProps) {

  // Filter supported languages to only show ones that the user's browser has a voice for
  const playableLanguages = voiceLanguages.length > 0
    ? SUPPORTED_LANGUAGES.filter((lang) => {
      const primaryCode = lang.code.split("-")[0].toLowerCase();
      return voiceLanguages.includes(primaryCode);
    })
    : SUPPORTED_LANGUAGES;

  return (
    <div className="fixed bottom-0 left-0 w-full z-40 px-4 pb-4 pointer-events-none">
      <div className="max-w-4xl mx-auto w-full pointer-events-auto transition-transform duration-500 transform translate-y-0">

        {/* Progress Bar (Attached to top of player) */}
        {(isPlaying || progress > 0 || isTranslatingChunk) && (
          <div className="w-full bg-[var(--bg-input)] h-1.5 rounded-t-xl overflow-hidden mx-auto shadow-[0_-4px_10px_rgba(0,0,0,0.1)] relative z-0 opacity-90">
            <div
              className={cn(
                "h-full transition-all duration-300 ease-out",
                progress === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-[gradient_2s_linear_infinite]"
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
            <label className="flex items-center gap-2 cursor-pointer group">
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
                  translationEnabled ? "bg-indigo-500" : "bg-[var(--bg-input)] border border-[var(--border-input)]"
                )}></div>
                <div className={cn(
                  "dot absolute left-1 top-1 w-4 h-4 rounded-full transition-all duration-300 shadow-sm",
                  translationEnabled ? "transform translate-x-4 bg-white" : "bg-[var(--text-muted)]"
                )}></div>
              </div>
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider transition-colors",
                translationEnabled ? "text-indigo-400" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
              )}>
                Translate
              </span>
            </label>

            {translationEnabled && (
              <div className="relative flex-1 animate-in slide-in-from-left-4 fade-in duration-300 max-w-[150px]">
                <select
                  value={targetLang}
                  onChange={(e) => {
                    setTargetLang(e.target.value);
                    setVoiceLang(e.target.value);
                  }}
                  disabled={isPlaying || isTranslating}
                  className="w-full appearance-none bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] text-xs font-medium rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-indigo-500/80 cursor-pointer disabled:opacity-50"
                >
                  {playableLanguages.map((lang) => (
                    <option key={`target-${lang.code}`} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-[var(--text-secondary)]">
                  <Globe className="w-3.5 h-3.5" />
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
                className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
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
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all transform hover:scale-105 active:scale-95"
                  >
                    <Play className="w-6 h-6 ml-1" fill="currentColor" />
                  </button>
                )}

                {/* Visualizer when playing */}
                <div className="w-10 h-6 flex items-center gap-0.5 justify-center ml-2">
                  {(isPlaying && !isPaused) ? (
                    <>
                      <span className="w-1 h-3 bg-indigo-400 rounded-full animate-[bounce_0.6s_infinite_100ms]" />
                      <span className="w-1 h-6 bg-purple-400 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
                      <span className="w-1 h-4 bg-indigo-400 rounded-full animate-[bounce_0.6s_infinite_150ms]" />
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

          {/* Right: Voice Settings */}
          <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-1/3">

            {/* Speed Control */}
            <div className="flex items-center gap-2 group/speed cursor-pointer relative">
              <div className="p-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-secondary)] hover:text-indigo-400 transition-colors">
                <Volume2 className="w-4 h-4" />
              </div>
              {/* Flyout slider */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-3 opacity-0 translate-y-2 pointer-events-none group-hover/speed:opacity-100 group-hover/speed:translate-y-0 group-hover/speed:pointer-events-auto transition-all duration-300 w-32 z-50">
                <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl p-3 shadow-xl">
                  <div className="text-center text-[10px] font-bold text-indigo-400 mb-2">{speechRate.toFixed(1)}x Speed</div>
                  <input type="range" min="0.5" max="2.0" step="0.1" value={speechRate} onChange={handleRateChange} className="w-full h-1.5 bg-[var(--bg-input)] rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
              </div>
            </div>

            {/* Voice Selection */}
            <div className="relative flex-1 max-w-[200px]">
              {filteredVoices.length === 0 ? (
                <select disabled className="w-full appearance-none bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-muted)] text-xs font-medium rounded-lg pl-3 pr-8 py-2 opacity-50 cursor-not-allowed">
                  <option>No voices found</option>
                </select>
              ) : (
                <select
                  value={selectedVoice?.name || ""}
                  onChange={handleVoiceChange}
                  className="w-full appearance-none bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] text-xs font-medium rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-indigo-500/80 cursor-pointer shadow-sm hover:border-indigo-500/40 transition-colors"
                >
                  {filteredVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>{voice.name}</option>
                  ))}
                </select>
              )}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-[var(--text-secondary)]">
                <Settings2 className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
