"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";

export default function Home() {
  // Application workspace state
  const [sourceText, setSourceText] = useState(
    "Welcome to Textora. This is a premium text-to-speech engine running directly in your browser. Feel free to adjust the voice rate, choose different voices, and set the text chunk size limit!\n\nThis application splits large text documents automatically so the browser doesn't block. It speaks each sentence sequentially, ensuring a smooth and natural listening experience."
  );
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [translatedText, setTranslatedText] = useState("");

  // Background/API state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [maxChunkSize, setMaxChunkSize] = useState(200);

  // Sequential Speech synthesiser hook
  const {
    isPlaying,
    isPaused,
    availableVoices,
    selectedVoice,
    speechRate,
    currentChunk,
    totalChunks,
    progress,
    isTranslatingChunk,
    speak,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
  } = useSpeechSynthesis();

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = availableVoices.find((v) => v.name === e.target.value) || null;
    setVoice(selected);
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRate(parseFloat(e.target.value));
  };

  const handleChunkSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxChunkSize(parseInt(e.target.value, 10));
  };

  // Perform full translation (static endpoint test)
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setTranslationError(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details?.join(", ") || "Failed to translate");
      }

      setTranslatedText(data.translatedText);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Translation service is currently unavailable.";
      setTranslationError(message);
    } finally {
      setIsTranslating(false);
    }
  };

  // Clear all states, inputs, and stop active speech playback
  const handleClear = () => {
    stop();
    setSourceText("");
    setTranslatedText("");
    setTranslationError(null);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background gradients for premium ambient feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900/60 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden relative shadow-lg shadow-indigo-500/10 border border-slate-800">
              <Image
                src="/logo.png"
                alt="Textora Logo"
                fill
                sizes="32px"
                className="object-cover"
                priority
              />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Textora
            </span>
          </div>
          <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            PRO
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* Main Grid: Input Source (Left/Top) & Output Target (Right/Bottom) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          
          {/* Source Column */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Source Document
              </span>
              <select
                aria-label="Source Language Selector"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                disabled={isPlaying || isTranslating}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500/80 cursor-pointer disabled:opacity-50"
              >
                <option value="en">English (US)</option>
                <option value="es">Spanish (ES)</option>
                <option value="fr">French (FR)</option>
                <option value="de">German (DE)</option>
              </select>
            </div>

            <textarea
              aria-label="Source Text Input"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              disabled={isPlaying || isTranslating}
              className="w-full flex-1 min-h-[220px] bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 transition-all resize-none text-sm leading-relaxed disabled:opacity-60"
              placeholder="Type or paste your text here..."
            />

            <div className="flex items-center justify-between border-t border-slate-850 pt-3">
              <button
                onClick={handleClear}
                className="px-3.5 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all text-xs font-medium"
              >
                Clear All
              </button>
              
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 font-mono">
                  {sourceText.length} chars
                </span>
                
                <button
                  onClick={handleTranslate}
                  disabled={isTranslating || !sourceText.trim() || isPlaying}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-slate-800 hover:bg-slate-750 text-white transition-all text-xs border border-slate-700 shadow-md disabled:opacity-40"
                >
                  {isTranslating ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Translating...
                    </>
                  ) : (
                    "Translate Text Only"
                  )}
                </button>
              </div>
            </div>

            {translationError && (
              <div className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3">
                <strong>Translation Error:</strong> {translationError}
              </div>
            )}
          </div>

          {/* Target / Audio Panel Column */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Translation Output
              </span>
              <select
                aria-label="Target Language Selector"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                disabled={isPlaying || isTranslating}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500/80 cursor-pointer disabled:opacity-50"
              >
                <option value="es">Spanish (ES)</option>
                <option value="en">English (US)</option>
                <option value="fr">French (FR)</option>
                <option value="de">German (DE)</option>
              </select>
            </div>

            <textarea
              aria-label="Translated Text Output"
              value={translatedText}
              onChange={(e) => setTranslatedText(e.target.value)}
              className="w-full flex-1 min-h-[220px] bg-slate-950/20 border border-slate-850 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none text-sm leading-relaxed"
              placeholder="Translated text will appear here. Or trigger the progressive pipeline below to translate and play sequentially on-the-fly."
            />

            <div className="flex items-center justify-between border-t border-slate-850 pt-3 text-xs text-slate-500">
              <span className="font-mono">{translatedText.length} chars</span>
              <span>Edit output directly if desired</span>
            </div>
          </div>

        </div>

        {/* Global Pipeline control console */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Control 1: Select Voice */}
            <div className="flex flex-col gap-2">
              <label htmlFor="voice-select" className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Speaker Voice
              </label>
              {availableVoices.length === 0 ? (
                <div className="text-xs text-slate-500 bg-slate-950/40 border border-slate-950 rounded-xl px-3 py-2">
                  No system voices available.
                </div>
              ) : (
                <select
                  id="voice-select"
                  value={selectedVoice?.name || ""}
                  onChange={handleVoiceChange}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/80 cursor-pointer"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Control 2: Speech Speed */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="speech-rate" className="text-xs font-bold tracking-wider text-slate-400 uppercase font-sans">
                  Voice Speed
                </label>
                <span className="text-xs font-bold text-indigo-400 font-mono">{speechRate.toFixed(1)}x</span>
              </div>
              <input
                id="speech-rate"
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speechRate}
                onChange={handleRateChange}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.5x</span>
                <span>1.0x (Normal)</span>
                <span>2.0x</span>
              </div>
            </div>

            {/* Control 3: Max Chunk Size */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="chunk-size" className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Text Segmentation Limit
                </label>
                <span className="text-xs font-bold text-indigo-400 font-mono">{maxChunkSize} chars</span>
              </div>
              <input
                id="chunk-size"
                type="range"
                min="50"
                max="500"
                step="25"
                value={maxChunkSize}
                onChange={handleChunkSizeChange}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50 chars</span>
                <span>200 chars (Default)</span>
                <span>500 chars</span>
              </div>
            </div>

          </div>

          {/* Active play status and progress bar */}
          {(isPlaying || progress > 0 || isTranslatingChunk) && (
            <div className="bg-slate-950/40 border border-slate-850/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2 w-2">
                    {isPlaying && !isPaused ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                      </>
                    ) : isPaused ? (
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    ) : (
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-600"></span>
                    )}
                  </span>
                  
                  <span className="text-xs font-semibold text-slate-300">
                    {isTranslatingChunk
                      ? `Translating Chunk ${currentChunk} / ${totalChunks}...`
                      : isPlaying && !isPaused
                      ? `Speaking Chunk ${currentChunk} / ${totalChunks}`
                      : isPaused
                      ? "Audio synthesis paused"
                      : "Playback idle"}
                  </span>
                </div>

                {/* Pulsing Audio visualizer */}
                {isPlaying && !isPaused && (
                  <div className="flex gap-0.5 items-end h-3">
                    <span className="w-0.5 h-1.5 bg-indigo-400 animate-[bounce_0.8s_infinite_100ms]" />
                    <span className="w-0.5 h-3 bg-indigo-400 animate-[bounce_0.8s_infinite_300ms]" />
                    <span className="w-0.5 h-2 bg-indigo-400 animate-[bounce_0.8s_infinite_200ms]" />
                    <span className="w-0.5 h-1 bg-indigo-400 animate-[bounce_0.8s_infinite_400ms]" />
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Synthesis Queue</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Unified Action buttons block */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            
            {/* Primary combined Translate & Speak action */}
            <button
              onClick={() => speak(sourceText, maxChunkSize, sourceLang, targetLang)}
              disabled={!sourceText.trim() || isTranslating}
              className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Translate & Speak Pipeline
            </button>

            {/* Speak output only */}
            <button
              onClick={() => speak(translatedText || sourceText, maxChunkSize)}
              disabled={(!translatedText.trim() && !sourceText.trim()) || isTranslating}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 border border-slate-750 text-sm shadow-md"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Speak Output Only
            </button>

            {/* Pause/Resume and Stop group */}
            {(isPlaying || isPaused) && (
              <div className="flex gap-2 w-full sm:w-auto">
                {isPlaying && !isPaused ? (
                  <button
                    onClick={pause}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all duration-200 shadow-md"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                    Pause
                  </button>
                ) : isPlaying && isPaused ? (
                  <button
                    onClick={resume}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all duration-200 shadow-md"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Resume
                  </button>
                ) : null}

                <button
                  onClick={stop}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-all duration-200 shadow-md"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h12v12H6z" />
                  </svg>
                  Stop
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Textora. Local Audio Synthesis & Secured Server Translation. All rights reserved.</p>
      </footer>
    </main>
  );
}
