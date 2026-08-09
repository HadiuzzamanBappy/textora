"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";

import { Header } from "../components/Header";
import { SettingsOffcanvas } from "../components/SettingsOffcanvas";
import { SourcePanel } from "../components/SourcePanel";
import { OutputPanel } from "../components/OutputPanel";
import { PlaybackControls } from "../components/PlaybackControls";
import { Info } from "lucide-react";

export default function Home() {
  // Application workspace state
  const [sourceText, setSourceText] = useState(
    "Welcome to Textora. This is a premium text-to-speech engine running directly in your browser. Feel free to adjust the voice rate, choose different voices, and set the text chunk size limit!\n\nThis application splits large text documents automatically so the browser doesn't block. It speaks each sentence sequentially, ensuring a smooth and natural listening experience."
  );
  
  // Try to load persisted state if possible
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [translatedText, setTranslatedText] = useState("");
  const [voiceLang, setVoiceLang] = useState("en");

  // Background/API state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [maxChunkSize, setMaxChunkSize] = useState(200);
  const [translationProvider, setTranslationProvider] = useState<"browser" | "google">("browser");

  // Theme state setup
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  // Settings offcanvas open state
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Load preferences from local storage on mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        if (savedTheme) {
          setTheme(savedTheme);
        } else {
          const isLight = document.documentElement.classList.contains("light");
          setTheme(isLight ? "light" : "dark");
        }
        
        const savedSourceLang = localStorage.getItem("sourceLang");
        if (savedSourceLang) setSourceLang(savedSourceLang);
        
        const savedTargetLang = localStorage.getItem("targetLang");
        if (savedTargetLang) setTargetLang(savedTargetLang);
        
        const savedVoiceLang = localStorage.getItem("voiceLang");
        if (savedVoiceLang) setVoiceLang(savedVoiceLang);
        
        const savedProvider = localStorage.getItem("translationProvider") as "browser" | "google" | null;
        if (savedProvider) setTranslationProvider(savedProvider);
        
        const savedProviderEnv = process.env.NEXT_PUBLIC_TRANSLATION_PROVIDER as "browser" | "google";
        if (!savedProvider && savedProviderEnv) {
          setTranslationProvider(savedProviderEnv);
        }
        
        const savedChunkSize = localStorage.getItem("maxChunkSize");
        if (savedChunkSize) setMaxChunkSize(parseInt(savedChunkSize, 10));
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem("sourceLang", sourceLang);
    localStorage.setItem("targetLang", targetLang);
    localStorage.setItem("voiceLang", voiceLang);
    localStorage.setItem("translationProvider", translationProvider);
    localStorage.setItem("maxChunkSize", maxChunkSize.toString());
  }, [sourceLang, targetLang, voiceLang, translationProvider, maxChunkSize]);


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

  // Show error toast if speech synthesis is not supported
  useEffect(() => {
    if (isSupported === false) {
      toast.error("Speech Synthesis Not Supported", {
        description: "Your browser does not support local text-to-speech rendering. Please use a modern browser like Chrome, Edge, or Safari.",
        duration: Infinity,
      });
    }
  }, [isSupported]);

  // Show toast when translation error changes
  useEffect(() => {
    if (translationError) {
      toast.error("Translation Failed", {
        description: translationError,
      });
    }
  }, [translationError]);

  // Get all unique voice languages from browser
  const voiceLanguages = useMemo(() => {
    const langs = new Set<string>();
    availableVoices.forEach((v) => {
      const primary = v.lang.split("-")[0].split("_")[0].toLowerCase();
      langs.add(primary);
    });
    return Array.from(langs).sort();
  }, [availableVoices]);

  // Filter voices based on selected voiceLang prefix
  const filteredVoices = useMemo(() => {
    return availableVoices.filter((v) => {
      const primary = v.lang.split("-")[0].split("_")[0].toLowerCase();
      return primary === voiceLang.toLowerCase();
    });
  }, [availableVoices, voiceLang]);

  // Automatically select a matching voice if current one belongs to a different language
  useEffect(() => {
    if (filteredVoices.length > 0) {
      const currentPrimary = selectedVoice?.lang.split("-")[0].split("_")[0].toLowerCase();
      if (currentPrimary !== voiceLang.toLowerCase()) {
        setVoice(filteredVoices[0]);
      }
    }
  }, [filteredVoices, voiceLang, selectedVoice, setVoice]);

  const getLanguageName = (code: string) => {
    const map: Record<string, string> = {
      en: "English", es: "Spanish", fr: "French", de: "German", zh: "Chinese",
      ja: "Japanese", pt: "Portuguese", it: "Italian", ru: "Russian", ko: "Korean",
      hi: "Hindi", bn: "Bengali", ar: "Arabic", nl: "Dutch", pl: "Polish",
      tr: "Turkish", vi: "Vietnamese",
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
    const toastId = toast.loading("Translating text...");

    try {
      const provider = translationProvider;

      if (provider === "browser") {
        const translationApi =
          (window as unknown as { translation?: { capabilities: () => Promise<{ canTranslate: (o: { sourceLanguage: string; targetLanguage: string }) => string }>; create: (o: { sourceLanguage: string; targetLanguage: string }) => Promise<{ translate: (t: string) => Promise<string> }> } }).translation ||
          (window as unknown as { ai?: { translator?: { capabilities: () => Promise<{ canTranslate: (o: { sourceLanguage: string; targetLanguage: string }) => string }>; create: (o: { sourceLanguage: string; targetLanguage: string }) => Promise<{ translate: (t: string) => Promise<string> }> } } }).ai?.translator;
        
        if (translationApi && sourceLang !== "auto") {
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
            toast.success("Translation complete", { id: toastId });
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
            toast.success("Translation complete", { id: toastId });
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
        toast.success("Translation complete", { id: toastId });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Translation service is currently unavailable.";
      setTranslationError(message);
      toast.error("Translation Failed", { id: toastId, description: message });
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
    toast.success("Pipeline started", { description: "Translating and speaking sequentially..." });
    speak(sourceText, maxChunkSize, sourceLang, targetLang, translationProvider);
  };

  // Clear all states, inputs, and stop active speech playback
  const handleClear = () => {
    stop();
    setSourceText("");
    setTranslatedText("");
    setTranslationError(null);
    toast.info("Workspace cleared");
  };

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden transition-colors duration-500">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-purple-500/10 blur-[150px] pointer-events-none mix-blend-screen" />

      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onOpenSettings={() => setSettingsOpen(true)} 
      />

      <SettingsOffcanvas
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        translationProvider={translationProvider}
        setTranslationProvider={setTranslationProvider}
        voiceLang={voiceLang}
        setVoiceLang={setVoiceLang}
        voiceLanguages={voiceLanguages}
        getLanguageName={getLanguageName}
        filteredVoices={filteredVoices}
        selectedVoice={selectedVoice}
        handleVoiceChange={handleVoiceChange}
        speechRate={speechRate}
        handleRateChange={handleRateChange}
        maxChunkSize={maxChunkSize}
        handleChunkSizeChange={handleChunkSizeChange}
        isPlaying={isPlaying}
        isTranslating={isTranslating}
      />

      {/* Main Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 relative z-10">
        
        {/* Main Grid: Input Source (Left) & Output Target (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          <SourcePanel
            sourceText={sourceText}
            setSourceText={setSourceText}
            sourceLang={sourceLang}
            setSourceLang={setSourceLang}
            isPlaying={isPlaying}
            isTranslating={isTranslating}
            handleClear={handleClear}
            handleTranslate={handleTranslate}
          />

          <OutputPanel
            translatedText={translatedText}
            setTranslatedText={setTranslatedText}
            targetLang={targetLang}
            setTargetLang={setTargetLang}
            setVoiceLang={setVoiceLang}
            isPlaying={isPlaying}
            isTranslating={isTranslating}
          />
        </div>

        <PlaybackControls
          isPlaying={isPlaying}
          isPaused={isPaused}
          progress={progress}
          isTranslatingChunk={isTranslatingChunk}
          currentChunk={currentChunk}
          totalChunks={totalChunks}
          sourceText={sourceText}
          translatedText={translatedText}
          isTranslating={isTranslating}
          maxChunkSize={maxChunkSize}
          handleSpeakPipeline={handleSpeakPipeline}
          speak={speak}
          pause={pause}
          resume={resume}
          stop={stop}
        />

        {/* PWA / Browser limits diagnostic section */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
          <details className="group">
            <summary className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] cursor-pointer select-none flex items-center justify-between p-1 rounded-lg hover:bg-[var(--bg-input)] transition-colors">
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                Platform Limitations & Diagnostics
              </span>
              <svg className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-4 text-sm text-[var(--text-secondary)] space-y-4 leading-relaxed border-t border-[var(--border-input)] pt-4">
              <p>
                <strong className="text-[var(--text-primary)]">Text-to-Speech (TTS) Engine:</strong> Browser-native audio synthesis runs locally via the Web Speech API (<code className="bg-[var(--bg-input)] px-1 rounded">window.speechSynthesis</code>). Behavior and features vary by browser and platform:
              </p>
              <ul className="pl-5 space-y-2 list-disc marker:text-indigo-500">
                <li>
                  <strong className="text-[var(--text-primary)]">iOS Safari / Chrome:</strong> Apple restricts automatic audio playback. You must manually trigger speech with a user gesture (tapping the &quot;Speak&quot; buttons). Background playback may stall when the screen locks.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Voice Options:</strong> Voices are device-specific. Premium voice models depend on your OS, and Safari/Chrome will load different voice profiles.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Keyless Translation Mode:</strong> Setting <code className="bg-[var(--bg-input)] px-1 rounded font-mono text-xs">NEXT_PUBLIC_TRANSLATION_PROVIDER=browser</code> enables 100% free translation utilizing your browser&apos;s native <code className="bg-[var(--bg-input)] px-1 rounded font-mono text-xs">window.translation</code> API.
                </li>
                <li>
                  <strong className="text-[var(--text-primary)]">Static vs Pipeline limits:</strong> Full static translation handles text up to 5,000 characters. For larger documents up to 50,000 characters, use the &quot;Translate & Speak Pipeline&quot;.
                </li>
              </ul>
            </div>
          </details>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border-bottom)] bg-[var(--bg-header)]/80 backdrop-blur-md py-6 text-center text-xs text-[var(--text-muted)] transition-colors mt-auto relative z-10">
        <p>© {new Date().getFullYear()} Textora. Local Audio Synthesis & Secured Server Translation. All rights reserved.</p>
      </footer>
    </main>
  );
}
