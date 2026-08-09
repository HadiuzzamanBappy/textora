import React from "react";
import { Play, Volume2, Pause, PlaySquare, Square } from "lucide-react";
import { cn } from "../utils/cn";

interface PlaybackControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  isTranslatingChunk: boolean;
  currentChunk: number;
  totalChunks: number;
  sourceText: string;
  translatedText: string;
  isTranslating: boolean;
  maxChunkSize: number;
  handleSpeakPipeline: () => void;
  speak: (text: string, chunkSize: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function PlaybackControls({
  isPlaying,
  isPaused,
  progress,
  isTranslatingChunk,
  currentChunk,
  totalChunks,
  sourceText,
  translatedText,
  isTranslating,
  maxChunkSize,
  handleSpeakPipeline,
  speak,
  pause,
  resume,
  stop,
}: PlaybackControlsProps) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden group/playback">
      {/* Decorative gradient for playback controls */}
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none transition-all duration-700" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none transition-all duration-700" />

      {/* Active play status and progress bar */}
      {(isPlaying || progress > 0 || isTranslatingChunk) && (
        <div className="bg-[var(--bg-input)]/80 backdrop-blur-sm border border-[var(--border-input)] rounded-xl p-4 space-y-4 shadow-inner relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                {isPlaying && !isPaused ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                  </>
                ) : isPaused ? (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-600"></span>
                )}
              </span>
              
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {isTranslatingChunk
                  ? `Translating Segment ${currentChunk} / ${totalChunks}...`
                  : isPlaying && !isPaused
                  ? `Speaking Segment ${currentChunk} / ${totalChunks}`
                  : isPaused
                  ? "Audio synthesis paused"
                  : "Playback idle"}
              </span>
            </div>

            {/* Pulsing Audio visualizer */}
            {isPlaying && !isPaused && (
              <div className="flex gap-1 items-end h-4">
                <span className="w-1 h-2 bg-indigo-400 rounded-full animate-[bounce_0.8s_infinite_100ms]" />
                <span className="w-1 h-4 bg-indigo-400 rounded-full animate-[bounce_0.8s_infinite_300ms]" />
                <span className="w-1 h-3 bg-indigo-400 rounded-full animate-[bounce_0.8s_infinite_200ms]" />
                <span className="w-1 h-1.5 bg-indigo-400 rounded-full animate-[bounce_0.8s_infinite_400ms]" />
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[var(--text-muted)] font-mono font-medium px-0.5">
              <span>Synthesis Queue Progress</span>
              <span className={cn("transition-colors", progress === 100 ? "text-emerald-400" : "text-indigo-400")}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--bg-main)] rounded-full overflow-hidden shadow-inner border border-[var(--border-input)]">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] transition-all duration-300 ease-out animate-[gradient_2s_linear_infinite]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Unified Action buttons block */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 relative z-10">
        
        {/* Primary combined Translate & Speak action */}
        <button
          onClick={handleSpeakPipeline}
          disabled={!sourceText.trim() || isTranslating}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer group"
        >
          <Play className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
          Translate & Speak Pipeline
        </button>

        {/* Speak output only */}
        <button
          onClick={() => speak(translatedText || sourceText, maxChunkSize)}
          disabled={(!translatedText.trim() && !sourceText.trim()) || isTranslating}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-semibold bg-[var(--bg-input)] hover:bg-indigo-500/5 hover:border-indigo-500/30 text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 border border-[var(--border-input)] text-sm shadow-md cursor-pointer group"
        >
          <Volume2 className="w-4.5 h-4.5 text-[var(--text-secondary)] group-hover:text-indigo-400 transition-colors" />
          Speak Output Only
        </button>

        {/* Pause/Resume and Stop group */}
        {(isPlaying || isPaused) && (
          <div className="flex gap-2 w-full sm:w-auto animate-in fade-in slide-in-from-left-4 duration-300">
            {isPlaying && !isPaused ? (
              <button
                onClick={pause}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 transition-all duration-200 shadow-md cursor-pointer group"
              >
                <Pause className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                Pause
              </button>
            ) : isPlaying && isPaused ? (
              <button
                onClick={resume}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all duration-200 shadow-md cursor-pointer group"
              >
                <PlaySquare className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                Resume
              </button>
            ) : null}

            <button
              onClick={stop}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-all duration-200 shadow-md cursor-pointer group"
            >
              <Square className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
              Stop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
