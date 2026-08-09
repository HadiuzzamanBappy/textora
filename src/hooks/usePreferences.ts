"use client";

import { useState, useEffect } from "react";

interface Voice {
  name: string;
  lang: string;
}

export function usePreferences(
  setRate: (rate: number) => void,
  selectedVoice: Voice | null
) {
  // App preferences state
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [voiceLang, setVoiceLang] = useState("en");
  const [voicePreferences, setVoicePreferences] = useState<Record<string, string>>({});
  
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [maxChunkSize, setMaxChunkSize] = useState(200);
  const [translationProvider, setTranslationProvider] = useState<"browser" | "google">("browser");
  
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Track speech rate locally to save it, even though useSpeechSynthesis manages it for audio
  const [localSpeechRate, setLocalSpeechRate] = useState(1);

  // Load preferences from local storage on mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const rawSettings = localStorage.getItem("textora_settings");
        if (rawSettings) {
          const settings = JSON.parse(rawSettings);
          
          if (settings.theme) setTheme(settings.theme);
          if (settings.sourceLang) setSourceLang(settings.sourceLang);
          if (settings.targetLang) setTargetLang(settings.targetLang);
          if (settings.voiceLang) setVoiceLang(settings.voiceLang);
          if (settings.translationProvider) setTranslationProvider(settings.translationProvider);
          if (settings.maxChunkSize !== undefined) setMaxChunkSize(settings.maxChunkSize);
          if (settings.translationEnabled !== undefined) setTranslationEnabled(settings.translationEnabled);
          if (settings.speechRate !== undefined) {
            setLocalSpeechRate(settings.speechRate);
            setRate(settings.speechRate);
          }
          if (settings.voicePreferences) setVoicePreferences(settings.voicePreferences);

          // Apply theme to document
          if (settings.theme === "light") {
            document.documentElement.classList.remove("dark");
            document.documentElement.classList.add("light");
          } else {
            document.documentElement.classList.remove("light");
            document.documentElement.classList.add("dark");
          }
        } else {
          // Default theme handling if no settings exist
          const isLight = document.documentElement.classList.contains("light");
          setTheme(isLight ? "light" : "dark");
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setIsLoaded(true);
      }
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [setRate]);

  // Save preferences when they change
  useEffect(() => {
    if (!isLoaded) return;
    
    // Update voice preferences dictionary if we have a selected voice
    const updatedVoicePreferences = { ...voicePreferences };
    if (selectedVoice) {
      updatedVoicePreferences[voiceLang] = selectedVoice.name;
    }

    const settings = {
      theme,
      sourceLang,
      targetLang,
      voiceLang,
      translationProvider,
      maxChunkSize,
      translationEnabled,
      speechRate: localSpeechRate,
      voicePreferences: updatedVoicePreferences,
    };

    localStorage.setItem("textora_settings", JSON.stringify(settings));
    
    // Update state to match if it changed, using setTimeout to prevent synchronous cascading renders
    if (selectedVoice && voicePreferences[voiceLang] !== selectedVoice.name) {
      setTimeout(() => {
        setVoicePreferences(updatedVoicePreferences);
      }, 0);
    }
  }, [
    theme, sourceLang, targetLang, voiceLang, translationProvider, 
    maxChunkSize, translationEnabled, localSpeechRate, selectedVoice, 
    isLoaded, voicePreferences
  ]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  };

  const handleRateChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    setLocalSpeechRate(newRate);
    setRate(newRate);
  };

  return {
    sourceLang, setSourceLang,
    targetLang, setTargetLang,
    voiceLang, setVoiceLang,
    voicePreferences, setVoicePreferences,
    translationEnabled, setTranslationEnabled,
    maxChunkSize, setMaxChunkSize,
    translationProvider, setTranslationProvider,
    theme, toggleTheme,
    localSpeechRate, handleRateChangeWrapper,
    isLoaded
  };
}
