"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";

import { Header } from "../components/Header";
import { SettingsOffcanvas } from "../components/SettingsOffcanvas";
import { DocumentReader } from "../components/DocumentReader";
import { BottomPlayer } from "../components/BottomPlayer";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { usePreferences } from "../hooks/usePreferences";
import { convertMp3ToWav } from "../utils/audioConverter";

const getLanguageName = (code: string) => {
  const map: Record<string, string> = {
    en: "English", es: "Spanish", fr: "French", de: "German", zh: "Chinese",
    ja: "Japanese", pt: "Portuguese", it: "Italian", ru: "Russian", ko: "Korean",
    hi: "Hindi", bn: "Bengali", ar: "Arabic", nl: "Dutch", pl: "Polish",
    tr: "Turkish", vi: "Vietnamese",
  };
  return map[code.toLowerCase()] || code.toUpperCase();
};

export default function Home() {
  // Application workspace state
  const [sourceText, setSourceText] = useState(
    "Welcome to Textora. This is a premium text-to-speech engine running directly in your browser. Feel free to adjust the voice rate, choose different voices, and set the text chunk size limit!\n\nThis application splits large text documents automatically so the browser doesn't block. It speaks each sentence sequentially, ensuring a smooth and natural listening experience."
  );
  
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Settings offcanvas open state
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Sequential Speech synthesiser hook
  const {
    isPlaying,
    isPaused,
    availableVoices,
    selectedVoice,
    progress,
    currentChunk,
    isTranslatingChunk,
    isSupported,
    speak,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
  } = useSpeechSynthesis();

  // Load preferences from our custom hook (removes 100+ lines of bloat!)
  const {
    sourceLang,
    targetLang, setTargetLang,
    voiceLang, setVoiceLang,
    voicePreferences,
    translationEnabled, setTranslationEnabled,
    maxChunkSize, setMaxChunkSize,
    translationProvider, setTranslationProvider,
    theme, toggleTheme,
    localSpeechRate, handleRateChangeWrapper: handleRateChange
  } = usePreferences(setRate, selectedVoice);



  // Show error toast if speech synthesis is not supported
  useEffect(() => {
    if (isSupported === false) {
      toast.error("Speech Synthesis Not Supported", {
        description: "Your browser does not support local text-to-speech rendering. Please use a modern browser like Chrome, Edge, or Safari.",
        duration: Infinity,
      });
    }
  }, [isSupported]);

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
        const savedVoiceName = voicePreferences[voiceLang];
        const match = savedVoiceName ? filteredVoices.find(v => v.name === savedVoiceName) : null;
        setVoice(match || filteredVoices[0]);
      }
    }
  }, [filteredVoices, voiceLang, selectedVoice, setVoice, voicePreferences]);

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = availableVoices.find((v) => v.name === e.target.value) || null;
    setVoice(selected);
  };

  const handleChunkSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxChunkSize(parseInt(e.target.value, 10));
  };

  // Perform full translation for the transcript view
  const handleTranslate = React.useCallback(async () => {
    if (!sourceText.trim()) return;

    if (sourceText.length > 5000) {
      toast.error("Static transcript translation is limited to 5,000 characters. The audio translation will still work for the full document.");
      return;
    }

    setIsTranslating(true);
    const toastId = toast.loading("Generating translation transcript...");

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
            toast.success("Transcript generated", { id: toastId });
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
            toast.success("Transcript generated", { id: toastId });
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
        toast.success("Transcript generated", { id: toastId });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Translation service is currently unavailable.";
      toast.error("Transcript Failed", { id: toastId, description: message });
    } finally {
      setIsTranslating(false);
    }
  }, [sourceText, translationProvider, sourceLang, targetLang]);

  // Track previous state to reset translation when inputs change (React recommended pattern)
  const [prevSourceText, setPrevSourceText] = useState(sourceText);
  const [prevTargetLang, setPrevTargetLang] = useState(targetLang);

  if (sourceText !== prevSourceText || targetLang !== prevTargetLang) {
    setPrevSourceText(sourceText);
    setPrevTargetLang(targetLang);
    setTranslatedText("");
  }

  // Auto-translate the document when translation is toggled on (if not already translated)
  useEffect(() => {
    if (translationEnabled && sourceText.trim() && !isTranslating) {
      if (!translatedText) {
        const timeoutId = setTimeout(() => {
          handleTranslate();
        }, 500); // 500ms debounce prevents aggressive fetching while typing
        return () => clearTimeout(timeoutId);
      }
    }
  }, [translationEnabled, translatedText, targetLang, sourceText, handleTranslate, isTranslating]);

  // Auto-detect language for voice selection when translation is disabled
  useEffect(() => {
    if (translationEnabled || !sourceText.trim()) return;

    const timeoutId = setTimeout(async () => {
      try {
        const sampleText = sourceText.substring(0, 500); // Only send first 500 chars to save bandwidth
        const freeUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(sampleText)}`;
        const res = await fetch(freeUrl);
        if (res.ok) {
          const data = await res.json();
          const detectedLang = data[2]; // Usually returns 'en', 'es', 'fr', etc.
          if (detectedLang && typeof detectedLang === 'string') {
            setVoiceLang(detectedLang);
          }
        }
      } catch (e) {
        console.error("Auto detect failed", e);
      }
    }, 1000); // 1-second debounce after typing/pasting

    return () => clearTimeout(timeoutId);
  }, [sourceText, translationEnabled, setVoiceLang]);

  // Main playback trigger
  const handlePlay = React.useCallback(async () => {
    if (!sourceText.trim()) return;

    if (sourceText.length > 50000) {
      toast.error("The document is limited to 50,000 characters to ensure browser tab stability. Please shorten your document.");
      return;
    }

    if (translationEnabled) {
      if (!translatedText) {
        // Fallback if the auto-translation hasn't finished yet
        await handleTranslate();
      }
      toast.success("Translating & Speaking...", { description: "Processing audio sequentially in the background." });
      speak(sourceText, maxChunkSize, sourceLang, targetLang, translationProvider);
    } else {
      toast.success("Speaking...", { description: "Processing audio sequentially." });
      speak(sourceText, maxChunkSize);
    }
  }, [sourceText, translationEnabled, speak, maxChunkSize, sourceLang, targetLang, translationProvider, handleTranslate, translatedText]);

  // Handle Export MP3/WAV
  const handleExport = React.useCallback(async (format: 'mp3' | 'wav') => {
    const textToExport = translationEnabled && translatedText ? translatedText : sourceText;
    const langToExport = translationEnabled ? targetLang : voiceLang;

    if (!textToExport.trim()) {
      toast.error("Please enter some text to export.");
      return;
    }

    if (textToExport.length > 50000) {
      toast.error("Document is too large for export (Limit: 50,000 chars).");
      return;
    }

    setIsExporting(true);
    const toastMessage = format === 'wav' 
      ? "Generating high-quality WAV audio... (this may take a moment)"
      : "Generating high-quality MP3 audio...";
    const toastId = toast.loading(toastMessage);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToExport,
          language: langToExport,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Export failed');
      }

      let blob = await response.blob();
      
      // If the user requested WAV, decode and re-encode the MP3 blob
      if (format === 'wav') {
        blob = await convertMp3ToWav(blob);
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `textora-audio.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`${format.toUpperCase()} generated and downloaded successfully!`, { id: toastId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast.error("Export Failed", { id: toastId, description: message });
    } finally {
      setIsExporting(false);
    }
  }, [sourceText, translatedText, translationEnabled, targetLang, voiceLang]);

  // Clear all states, inputs, and stop active speech playback
  const handleClear = React.useCallback(() => {
    stop();
    setSourceText("");
    setTranslatedText("");
    toast.info("Document cleared");
  }, [stop]);

  // Global Keyboard Accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in a textarea or input
      if (
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "INPUT"
      ) {
        return;
      }

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (isPlaying && !isPaused) {
          pause();
        } else if (isPlaying && isPaused) {
          resume();
        } else if (!isPlaying) {
          handlePlay();
        }
      } else if (e.key === "Escape") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isPaused, pause, resume, handlePlay, handleClear]);

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-rose-200 selection:text-rose-900 dark:selection:bg-rose-900 dark:selection:text-rose-100 relative transition-colors duration-500">
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-rose-500/10 blur-[150px] mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-orange-500/10 blur-[150px] mix-blend-screen" />
        </div>

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
          speechRate={localSpeechRate}
          handleRateChange={handleRateChange}
          maxChunkSize={maxChunkSize}
          handleChunkSizeChange={handleChunkSizeChange}
          isPlaying={isPlaying}
          isTranslating={isTranslating}
        />

        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center gap-6 relative z-10 pb-72 md:pb-32">
          <DocumentReader
            sourceText={sourceText}
            setSourceText={(text) => {
              setSourceText(text);
              if (translatedText) setTranslatedText("");
            }}
            translatedText={translatedText}
            isPlaying={isPlaying}
            isTranslating={isTranslating}
            handleClear={handleClear}
            translationEnabled={translationEnabled}
            targetLang={targetLang}
            sourceLang={sourceLang}
            voiceLang={voiceLang}
            currentChunk={currentChunk}
            maxChunkSize={maxChunkSize}
          />


        </div>

        <BottomPlayer
          isPlaying={isPlaying}
          isPaused={isPaused}
          progress={progress}
          sourceText={sourceText}
          isTranslating={isTranslating}
          isTranslatingChunk={isTranslatingChunk}
          isExporting={isExporting}
          translationEnabled={translationEnabled}
          setTranslationEnabled={setTranslationEnabled}
          targetLang={targetLang}
          setTargetLang={setTargetLang}
          setVoiceLang={setVoiceLang}
          voiceLang={voiceLang}
          voiceLanguages={voiceLanguages}
          filteredVoices={filteredVoices}
          selectedVoice={selectedVoice}
          handleVoiceChange={handleVoiceChange}
          speechRate={localSpeechRate}
          handleRateChange={handleRateChange}
          handlePlay={handlePlay}
          pause={pause}
          resume={resume}
          stop={stop}
          handleExport={handleExport}
        />
      </main>
    </ErrorBoundary>
  );
}
