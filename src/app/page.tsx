"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";

export default function Home() {
  // Source translation states
  const [sourceText, setSourceText] = useState(
    "Welcome to Textora. This is a premium text-to-speech engine running directly in your browser. Feel free to adjust the voice rate, choose different voices, and set the text chunk size limit!"
  );
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [translatedText, setTranslatedText] = useState("");

  // Translation request states
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // Chunk size limit state
  const [maxChunkSize, setMaxChunkSize] = useState(200);

  // Browser Speech Hook
  const {
    isPlaying,
    isPaused,
    availableVoices,
    selectedVoice,
    speechRate,
    currentChunk,
    totalChunks,
    progress,
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

  // Perform translation request to /api/translate
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background gradients for premium ambient feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden relative shadow-lg shadow-indigo-500/10 border border-slate-800">
              <Image
                src="/logo.png"
                alt="Textora Logo"
                fill
                sizes="36px"
                className="object-cover"
                priority
              />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Textora
            </span>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            Translator & Queue Active
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col justify-center gap-8">
        
        {/* Hero title */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">
            Translate and{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Speak Instantly
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Input source text, translate it server-side, and synthesize the result into speech segments using native browser voices.
          </p>
        </div>

        {/* Dashboard Workspace */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
          
          {/* Workspace grid: Left = Source, Right = Target */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Side: Translation Source */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label htmlFor="source-text" className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Source Text
                </label>
                <select
                  aria-label="Source Language"
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500/80 cursor-pointer"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Spanish (ES)</option>
                  <option value="fr">French (FR)</option>
                  <option value="de">German (DE)</option>
                </select>
              </div>

              <textarea
                id="source-text"
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="w-full h-48 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 transition-all resize-none text-sm leading-relaxed"
                placeholder="Enter text to translate..."
              />

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{sourceText.length} / 5000 chars</span>
                <button
                  onClick={handleTranslate}
                  disabled={isTranslating || !sourceText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs"
                >
                  {isTranslating ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Translate
                    </>
                  )}
                </button>
              </div>

              {translationError && (
                <div className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 mt-1">
                  <strong>Error: </strong> {translationError}
                </div>
              )}
            </div>

            {/* Right Side: Translation Target & Speech Synthesis */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label htmlFor="target-text" className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Translation & Speech
                </label>
                <select
                  aria-label="Target Language"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500/80 cursor-pointer"
                >
                  <option value="es">Spanish (ES)</option>
                  <option value="en">English (US)</option>
                  <option value="fr">French (FR)</option>
                  <option value="de">German (DE)</option>
                </select>
              </div>

              <textarea
                id="target-text"
                value={translatedText}
                onChange={(e) => setTranslatedText(e.target.value)}
                className="w-full h-48 bg-slate-950/20 border border-slate-850 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none text-sm leading-relaxed"
                placeholder="Translated text will appear here. You can also edit it before speaking..."
              />

              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>{translatedText.length} chars</span>
                <span>Editable Output</span>
              </div>
            </div>

          </div>

          {/* Speech Control Drawer */}
          <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 mt-6 space-y-6">
            
            {/* Status & Progress Indicators */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-950/70 border border-slate-900 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    {isPlaying && !isPaused ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                      </>
                    ) : isPaused ? (
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    ) : (
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-600"></span>
                    )}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Speech Status:{" "}
                    <span className={isPlaying && !isPaused ? "text-indigo-400" : isPaused ? "text-amber-400" : "text-slate-400"}>
                      {isPlaying && !isPaused ? "Speaking" : isPaused ? "Paused" : "Idle"}
                    </span>
                  </span>
                </div>
                
                {isPlaying && totalChunks > 0 && (
                  <span className="text-xs font-medium text-slate-400 bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-800">
                    Chunk {currentChunk} / {totalChunks}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {(isPlaying || progress > 0) && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Playback Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Config Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Select Voice */}
              <div className="flex flex-col gap-2">
                <label htmlFor="voice-select" className="text-xs font-bold tracking-wider text-slate-400 uppercase">Select Voice</label>
                {availableVoices.length === 0 ? (
                  <div className="text-xs text-slate-500 bg-slate-950/40 border border-slate-950 rounded-xl px-3 py-2">
                    No voices detected.
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

              {/* Speech Speed */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="speech-rate" className="text-xs font-bold tracking-wider text-slate-400 uppercase">Speed Rate</label>
                  <span className="text-xs font-bold text-indigo-400">{speechRate.toFixed(1)}x</span>
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
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0.5x</span>
                  <span>1.0x</span>
                  <span>2.0x</span>
                </div>
              </div>

              {/* Max Chunk Size */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="chunk-size" className="text-xs font-bold tracking-wider text-slate-400 uppercase">Max Chunk Size</label>
                  <span className="text-xs font-bold text-indigo-400">{maxChunkSize} chars</span>
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
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>50 chars</span>
                  <span>500 chars</span>
                </div>
              </div>

            </div>

            {/* Playback Trigger Bar */}
            <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-slate-850">
              <button
                onClick={() => speak(translatedText || sourceText, maxChunkSize)}
                disabled={!translatedText.trim() && !sourceText.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Speak Output
              </button>

              {isPlaying && !isPaused ? (
                <button
                  onClick={pause}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                  Pause
                </button>
              ) : isPlaying && isPaused ? (
                <button
                  onClick={resume}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Resume
                </button>
              ) : null}

              <button
                onClick={stop}
                disabled={!isPlaying}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z" />
                </svg>
                Stop
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Textora. Local Audio Synthesis & Secured Server Translation. No client secrets exposed.</p>
      </footer>
    </main>
  );
}
