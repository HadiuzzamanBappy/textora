"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";

export default function Home() {
  const [text, setText] = useState(
    "Welcome to Textora. This is a premium text-to-speech engine running directly in your browser. Feel free to adjust the voice rate, choose different voices, and set the text chunk size limit!\n\nThis application splits large text documents automatically so the browser doesn't block. It speaks each sentence sequentially, ensuring a smooth and natural listening experience."
  );
  const [maxChunkSize, setMaxChunkSize] = useState(200);

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
            Sequential Queue Active
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
        
        {/* Hero title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Speech Synthesis{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Playground
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Configure text-to-speech parameters and listen to native browser-synthesized audio in real-time.
          </p>
        </div>

        {/* Dashboard Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
          
          {/* Status & Progress Indicators */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-950/40 border border-slate-900 rounded-xl px-4 py-3">
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
                  Status:{" "}
                  <span className={isPlaying && !isPaused ? "text-indigo-400" : isPaused ? "text-amber-400" : "text-slate-400"}>
                    {isPlaying && !isPaused ? "Speaking" : isPaused ? "Paused" : "Idle"}
                  </span>
                </span>
              </div>
              
              {/* Display current chunk tracking if speaking */}
              {isPlaying && totalChunks > 0 && (
                <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                  Chunk {currentChunk} / {totalChunks}
                </span>
              )}
              
              {/* Visualizer bars when playing */}
              {isPlaying && !isPaused && (
                <div className="flex gap-0.5 items-end h-4">
                  <span className="w-0.5 h-2 bg-indigo-400 animate-[bounce_0.8s_infinite_100ms]" />
                  <span className="w-0.5 h-4 bg-indigo-400 animate-[bounce_0.8s_infinite_300ms]" />
                  <span className="w-0.5 h-3 bg-indigo-400 animate-[bounce_0.8s_infinite_200ms]" />
                  <span className="w-0.5 h-1 bg-indigo-400 animate-[bounce_0.8s_infinite_400ms]" />
                </div>
              )}
            </div>

            {/* Progress Bar (Visible during playback or when completion is registered) */}
            {(isPlaying || progress > 0) && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Playback Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Text Input Area */}
          <div className="flex flex-col gap-2">
            <label htmlFor="tts-input" className="text-xs font-bold tracking-wider text-slate-400 uppercase">Input Text</label>
            <textarea
              id="tts-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-40 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 transition-all resize-none text-sm leading-relaxed"
              placeholder="Enter some text for the engine to read aloud..."
            />
          </div>

          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* Control 1: Voice list */}
            <div className="flex flex-col gap-2">
              <label htmlFor="voice-select" className="text-xs font-bold tracking-wider text-slate-400 uppercase">Select Voice</label>
              {availableVoices.length === 0 ? (
                <div className="text-xs text-slate-500 bg-slate-950/40 border border-slate-950 rounded-xl px-3 py-2">
                  No voices detected. Make sure your browser supports SpeechSynthesis.
                </div>
              ) : (
                <select
                  id="voice-select"
                  value={selectedVoice?.name || ""}
                  onChange={handleVoiceChange}
                  className="w-full bg-slate-950 border border-slate-800/80 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/80 cursor-pointer"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang}) {voice.default ? "— Default" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Control 2: Speed Rate */}
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
                <span>0.5x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Fast)</span>
              </div>
            </div>

            {/* Control 3: Chunk Size Config */}
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
                <span>50 (Short sentences)</span>
                <span>500 (Long paragraphs)</span>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-slate-850">
            <button
              onClick={() => speak(text, maxChunkSize)}
              disabled={!text.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Speak
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

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Textora. Local Audio Synthesis Engine. No cloud APIs required.</p>
      </footer>
    </main>
  );
}
