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
  const [voiceLang, setVoiceLang] = useState("es");

  // Background/API state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [maxChunkSize, setMaxChunkSize] = useState(200);
  const [translationProvider, setTranslationProvider] = useState<"browser" | "google">(
    (process.env.NEXT_PUBLIC_TRANSLATION_PROVIDER as "browser" | "google") || "browser"
  );

  // Theme state setup
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  // Settings offcanvas open state
  const [settingsOpen, setSettingsOpen] = useState(false);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      const isLight = document.documentElement.classList.contains("light");
      setTheme(isLight ? "light" : "dark");
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  };

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
    isSupported,
    speak,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
  } = useSpeechSynthesis();

  // Get all unique voice languages from browser
  const voiceLanguages = React.useMemo(() => {
    const langs = new Set<string>();
    availableVoices.forEach((v) => {
      const primary = v.lang.split("-")[0].split("_")[0].toLowerCase();
      langs.add(primary);
    });
    return Array.from(langs).sort();
  }, [availableVoices]);

  // Filter voices based on selected voiceLang prefix
  const filteredVoices = React.useMemo(() => {
    return availableVoices.filter((v) => {
      const primary = v.lang.split("-")[0].split("_")[0].toLowerCase();
      return primary === voiceLang.toLowerCase();
    });
  }, [availableVoices, voiceLang]);

  // Automatically select a matching voice if current one belongs to a different language
  React.useEffect(() => {
    if (filteredVoices.length > 0) {
      const currentPrimary = selectedVoice?.lang.split("-")[0].split("_")[0].toLowerCase();
      if (currentPrimary !== voiceLang.toLowerCase()) {
        setVoice(filteredVoices[0]);
      }
    }
  }, [filteredVoices, voiceLang, selectedVoice, setVoice]);

  const getLanguageName = (code: string) => {
    const map: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      zh: "Chinese",
      ja: "Japanese",
      pt: "Portuguese",
      it: "Italian",
      ru: "Russian",
      ko: "Korean",
      hi: "Hindi",
      bn: "Bengali",
      ar: "Arabic",
      nl: "Dutch",
      pl: "Polish",
      tr: "Turkish",
      vi: "Vietnamese",
    };
    return map[code.toLowerCase()] || code.toUpperCase();
  };

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

    if (sourceText.length > 5000) {
      setTranslationError("Full document static translation is limited to 5,000 characters. For larger documents, please use the 'Translate & Speak Pipeline' below, which translates progressively chunk-by-chunk.");
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);

    try {
      const provider = translationProvider;

      if (provider === "browser") {
        const translationApi =
          (window as unknown as { translation?: { capabilities: () => Promise<{ canTranslate: (o: { sourceLanguage: string; targetLanguage: string }) => string }>; create: (o: { sourceLanguage: string; targetLanguage: string }) => Promise<{ translate: (t: string) => Promise<string> }> } }).translation ||
          (window as unknown as { ai?: { translator?: { capabilities: () => Promise<{ canTranslate: (o: { sourceLanguage: string; targetLanguage: string }) => string }>; create: (o: { sourceLanguage: string; targetLanguage: string }) => Promise<{ translate: (t: string) => Promise<string> }> } } }).ai?.translator;
        if (translationApi) {
          const capabilities = await translationApi.capabilities();
          const canTranslate = capabilities.canTranslate({
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
          });

          if (canTranslate !== "no") {
            const translator = await translationApi.create({
              sourceLanguage: sourceLang,
              targetLanguage: targetLang,
            });
            const result = await translator.translate(sourceText);
            setTranslatedText(result);
          } else {
            throw new Error("Local browser translation pair not supported.");
          }
        } else {
          // Free scraping Google Translation fallback
          const freeUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(sourceText)}`;
          const res = await fetch(freeUrl);
          if (res.ok) {
            const data = await res.json() as [[[string, string]]];
            const result = data[0].map((x) => x[0]).join("");
            setTranslatedText(result);
          } else {
            throw new Error("Fallback Google Scraping Translation failed.");
          }
        }
      } else {
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
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Translation service is currently unavailable.";
      setTranslationError(message);
    } finally {
      setIsTranslating(false);
    }
  };

  // Progressive Speak Pipeline Trigger with size limits validation
  const handleSpeakPipeline = () => {
    if (!sourceText.trim()) return;

    if (sourceText.length > 50000) {
      setTranslationError("The progressive translation pipeline is limited to 50,000 characters to ensure browser tab stability. Please shorten your document.");
      return;
    }

    setTranslationError(null);
    speak(sourceText, maxChunkSize, sourceLang, targetLang, translationProvider);
  };

  // Clear all states, inputs, and stop active speech playback
  const handleClear = () => {
    stop();
    setSourceText("");
    setTranslatedText("");
    setTranslationError(null);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden transition-colors">
      {/* Background gradients for premium ambient feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-[var(--border-bottom)] bg-[var(--bg-header)] backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden relative shadow-lg shadow-indigo-500/10 border border-[var(--border-input)]">
              <Image
                src="/logo.png"
                alt="Textora Logo"
                fill
                sizes="32px"
                className="object-cover"
                priority
              />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
              Textora
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Settings Gear Button */}
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Open Settings"
              className="p-2 rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/60 transition-all cursor-pointer shadow-sm group"
            >
              <svg className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-sm"
            >
              {theme === "dark" ? (
                <svg className="w-4 h-4 animate-[spin_4s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              PRO
            </span>
          </div>
        </div>
      </header>

      {/* Settings Offcanvas Backdrop */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          onClick={() => setSettingsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Settings Offcanvas Panel */}
      <aside
        aria-label="Settings Panel"
        className={`fixed top-0 right-0 z-[70] h-full w-full sm:w-[420px] bg-[var(--bg-card)] border-l border-[var(--border-card)] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          settingsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Offcanvas Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-input)] shrink-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-sm font-bold tracking-wider text-[var(--text-primary)] uppercase">Settings</h2>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            aria-label="Close Settings"
            className="p-1.5 rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Offcanvas Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {/* Section: Translation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-input)]">
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-secondary)] uppercase">Translation</span>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="s-provider-select" className="text-xs font-bold text-[var(--text-secondary)]">Translation Method</label>
              <select
                id="s-provider-select"
                value={translationProvider}
                onChange={(e) => setTranslationProvider(e.target.value as "browser" | "google")}
                disabled={isPlaying || isTranslating}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/80 cursor-pointer disabled:opacity-50"
              >
                <option value="browser">Free Web Translator (Keyless/Client)</option>
                <option value="google">Google Cloud API (Requires Key)</option>
              </select>
            </div>

            {translationProvider === "google" && !process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY && (
              <div className="text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
                <strong>Notice:</strong> Google Cloud API requires <code className="font-mono">GOOGLE_TRANSLATE_API_KEY</code> set in environment variables.
              </div>
            )}
          </div>

          {/* Section: Speech Synthesis */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-input)]">
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-secondary)] uppercase">Speech Synthesis</span>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="s-voice-lang-select" className="text-xs font-bold text-[var(--text-secondary)]">Voice Language</label>
              <select
                id="s-voice-lang-select"
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/80 cursor-pointer"
              >
                {voiceLanguages.map((code) => (
                  <option key={code} value={code}>{getLanguageName(code)} ({code.toUpperCase()})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="s-voice-select" className="text-xs font-bold text-[var(--text-secondary)]">Voice Speaker</label>
              {filteredVoices.length === 0 ? (
                <select id="s-voice-select" disabled className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-muted)] text-xs rounded-xl px-3 py-2.5 opacity-50">
                  <option>No voices found for this language</option>
                </select>
              ) : (
                <select
                  id="s-voice-select"
                  value={selectedVoice?.name || ""}
                  onChange={handleVoiceChange}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/80 cursor-pointer"
                >
                  {filteredVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Voice Speed Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="s-speech-rate" className="text-xs font-bold text-[var(--text-secondary)]">Voice Speed</label>
                <span className="text-xs font-bold text-indigo-400 font-mono">{speechRate.toFixed(1)}x</span>
              </div>
              <input id="s-speech-rate" type="range" min="0.5" max="2.0" step="0.1" value={speechRate} onChange={handleRateChange} className="w-full h-2 bg-[var(--bg-input)] rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                <span>0.5x</span><span>2.0x</span>
              </div>
            </div>

            {/* Text Segmentation Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="s-chunk-size" className="text-xs font-bold text-[var(--text-secondary)]">Text Segmentation</label>
                <span className="text-xs font-bold text-indigo-400 font-mono">{maxChunkSize} chars</span>
              </div>
              <input id="s-chunk-size" type="range" min="50" max="500" step="25" value={maxChunkSize} onChange={handleChunkSizeChange} className="w-full h-2 bg-[var(--bg-input)] rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                <span>50 ch</span><span>500 ch</span>
              </div>
            </div>
          </div>

        </div>

        {/* Offcanvas Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-input)] shrink-0">
          <button
            onClick={() => setSettingsOpen(false)}
            className="w-full py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/30 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {!isSupported && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl p-4 text-sm flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="font-semibold">Speech Synthesis Not Supported:</span> Your browser does not support local text-to-speech rendering. Please use a modern browser (Chrome, Edge, Safari, Firefox).
            </div>
          </div>
        )}

        {/* Main Grid: Input Source (Left/Top) & Output Target (Right/Bottom) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          
          {/* Source Column */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 backdrop-blur-sm flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Source Document
              </span>
              <select
                aria-label="Source Language Selector"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                disabled={isPlaying || isTranslating}
                className="bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-secondary)] text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500/80 cursor-pointer disabled:opacity-50"
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
              className="w-full flex-1 min-h-[220px] bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl p-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 transition-all resize-none text-sm leading-relaxed disabled:opacity-60"
              placeholder="Type or paste your text here..."
            />

            <div className="flex items-center justify-between border-t border-[var(--border-input)] pt-3">
              <button
                onClick={handleClear}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--border-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] transition-all text-xs font-medium cursor-pointer"
              >
                Clear All
              </button>
              
              <div className="flex items-center gap-4">
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {sourceText.length} chars
                </span>
                
                <button
                  onClick={handleTranslate}
                  disabled={isTranslating || !sourceText.trim() || isPlaying}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-[var(--bg-input)] hover:opacity-90 text-[var(--text-primary)] transition-all text-xs border border-[var(--border-input)] shadow-md disabled:opacity-40 cursor-pointer"
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
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 backdrop-blur-sm flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Translation Output
              </span>
              <select
                aria-label="Target Language Selector"
                value={targetLang}
                onChange={(e) => {
                  setTargetLang(e.target.value);
                  setVoiceLang(e.target.value);
                }}
                disabled={isPlaying || isTranslating}
                className="bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-secondary)] text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500/80 cursor-pointer disabled:opacity-50"
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
              className="w-full flex-1 min-h-[220px] bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl p-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500/50 resize-none text-sm leading-relaxed"
              placeholder="Translated text will appear here. Or trigger the progressive pipeline below to translate and play sequentially on-the-fly."
            />

            <div className="flex items-center justify-between border-t border-[var(--border-input)] pt-3 text-xs text-[var(--text-muted)]">
              <span className="font-mono">{translatedText.length} chars</span>
              <span>Edit output directly if desired</span>
            </div>
          </div>

        </div>



        {/* Global Pipeline controls and visualizer */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 shadow-2xl space-y-4">
          {/* Active play status and progress bar */}
          {(isPlaying || progress > 0 || isTranslatingChunk) && (
            <div className="bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl p-4 space-y-3">
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
                  
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">
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
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                  <span>Synthesis Queue</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--bg-main)] rounded-full overflow-hidden">
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
              onClick={handleSpeakPipeline}
              disabled={!sourceText.trim() || isTranslating}
              className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer"
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
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-[var(--bg-input)] hover:opacity-95 text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 border border-[var(--border-input)] text-sm shadow-md cursor-pointer"
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
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-[var(--bg-input)] hover:opacity-90 text-[var(--text-primary)] border border-[var(--border-input)] transition-all duration-200 shadow-md cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                    Pause
                  </button>
                ) : isPlaying && isPaused ? (
                  <button
                    onClick={resume}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all duration-200 shadow-md cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Resume
                  </button>
                ) : null}

                <button
                  onClick={stop}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-all duration-200 shadow-md cursor-pointer"
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

        {/* PWA / Browser limits diagnostic section */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 backdrop-blur-sm shadow-xl">
          <details className="group">
            <summary className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] cursor-pointer select-none flex items-center justify-between">
              <span>Platform Limitations & Diagnostics</span>
              <svg className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-4 text-xs text-[var(--text-secondary)] space-y-3 leading-relaxed border-t border-[var(--border-input)] pt-4">
              <p>
                <strong>Text-to-Speech (TTS) Engine:</strong> Browser-native audio synthesis runs locally via the Web Speech API (`window.speechSynthesis`). Behavior and features vary by browser and platform:
              </p>
              <ul className="list-styled pl-5 space-y-1.5 list-disc">
                <li>
                  <strong>iOS Safari / Chrome:</strong> Apple restricts automatic audio playback. You must manually trigger speech with a user gesture (tapping the {"\"Speak\""} buttons). Background playback may stall when the screen locks.
                </li>
                <li>
                  <strong>Voice Options:</strong> Voices are device-specific. Premium voice models (like {"Apple's"} Siri voices or Google{"'s"} neural models) depend on your OS, and Safari/Chrome will load different voice profiles.
                </li>
                <li>
                  <strong>Keyless Translation Mode:</strong> Setting `NEXT_PUBLIC_TRANSLATION_PROVIDER=browser` enables 100% free translation utilizing your browser{"'s"} native `window.translation` API, or falls back automatically to Google{"'s"} keyless Web translation interface.
                </li>
                <li>
                  <strong>Static vs Pipeline limits:</strong> Full static translation handles text up to 5,000 characters. For larger documents up to 50,000 characters, use the {"\"Translate & Speak Pipeline\""} which segments, translates, and plays sequentially to bypass single-request thresholds.
                </li>
              </ul>
            </div>
          </details>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border-bottom)] bg-[var(--bg-header)] py-6 text-center text-xs text-[var(--text-muted)] transition-colors">
        <p>© 2026 Textora. Local Audio Synthesis & Secured Server Translation. All rights reserved.</p>
      </footer>
    </main>
  );
}
