"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { chunkText } from "../utils/textChunker";

export interface SpeechSynthesisState {
  isPlaying: boolean;
  isPaused: boolean;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  speechRate: number;
  currentChunk: number; // 1-based index
  totalChunks: number;
  progress: number; // 0 to 100
  isTranslatingChunk: boolean; // True when fetch is in flight
  isSupported: boolean; // True if browser supports SpeechSynthesis
}

export function useSpeechSynthesis() {
  const [state, setState] = useState<SpeechSynthesisState>({
    isPlaying: false,
    isPaused: false,
    availableVoices: [],
    selectedVoice: null,
    speechRate: 1,
    currentChunk: 0,
    totalChunks: 0,
    progress: 0,
    isTranslatingChunk: false,
    isSupported: true, // Default to true until checked in client mount
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sessionRef = useRef<number>(0);
  const chunksRef = useRef<string[]>([]);
  const currentIndexRef = useRef<number>(0);
  const playChunkRef = useRef<(index: number, session: number, sourceLang?: string, targetLang?: string) => void>(() => {});

  // Helper to safely fetch window.speechSynthesis
  const getSynth = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      return window.speechSynthesis;
    }
    return null;
  }, []);

  const loadVoices = useCallback(() => {
    const synth = getSynth();
    if (!synth) return;

    const voices = synth.getVoices();
    setState((prev) => {
      const currentSelected = prev.selectedVoice;
      let newSelected =
        voices.find(
          (v) => v.name === currentSelected?.name && v.lang === currentSelected?.lang
        ) || null;

      if (!newSelected && voices.length > 0) {
        newSelected =
          voices.find((v) => v.default) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];
      }

      return {
        ...prev,
        availableVoices: voices,
        selectedVoice: newSelected,
      };
    });
  }, [getSynth]);

  useEffect(() => {
    const synth = getSynth();
    const supported = synth !== null;

    // Load voices on next tick to avoid calling setState synchronously during rendering/effect phase
    const timeoutId = setTimeout(() => {
      setState((prev) => ({ ...prev, isSupported: supported }));
      if (supported) {
        loadVoices();
      }
    }, 0);

    if (!synth) return;

    const handleVoicesChanged = () => {
      loadVoices();
    };

    if (synth.addEventListener) {
      synth.addEventListener("voiceschanged", handleVoicesChanged);
    } else {
      synth.onvoiceschanged = handleVoicesChanged;
    }

    return () => {
      clearTimeout(timeoutId);
      if (synth.removeEventListener) {
        synth.removeEventListener("voiceschanged", handleVoicesChanged);
      } else {
        synth.onvoiceschanged = null;
      }
      // Cancel speech on unmount
      synth.cancel();
    };
  }, [getSynth, loadVoices]);

  const stop = useCallback(() => {
    const synth = getSynth();
    sessionRef.current++; // Invalidate active async callbacks
    
    if (synth) {
      synth.cancel();
    }
    
    chunksRef.current = [];
    currentIndexRef.current = 0;
    utteranceRef.current = null;

    setState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      currentChunk: 0,
      totalChunks: 0,
      progress: 0,
      isTranslatingChunk: false,
    }));
  }, [getSynth]);

  const pause = useCallback(() => {
    const synth = getSynth();
    if (!synth) return;
    synth.pause();
    setState((prev) => ({ ...prev, isPaused: true }));
  }, [getSynth]);

  const resume = useCallback(() => {
    const synth = getSynth();
    if (!synth) return;
    synth.resume();
    setState((prev) => ({ ...prev, isPaused: false, isPlaying: true }));
  }, [getSynth]);

  // Plays a single chunk from chunksRef.current at specified index
  const playChunk = useCallback(
    async (index: number, session: number, sourceLang?: string, targetLang?: string) => {
      const synth = getSynth();
      if (!synth) return;

      // Invalidate if a newer speech session was started or stopped
      if (session !== sessionRef.current) return;

      // Completed all chunks
      if (index >= chunksRef.current.length) {
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
          currentChunk: 0,
          totalChunks: 0,
          progress: 100,
          isTranslatingChunk: false,
        }));
        return;
      }

      // Update tracking states for the current chunk
      setState((prev) => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
        currentChunk: index + 1,
        totalChunks: chunksRef.current.length,
        progress: Math.round((index / chunksRef.current.length) * 100),
      }));

      let textToSpeak = chunksRef.current[index];

      // Perform progressive translation chunk-by-chunk if translation parameters are provided
      if (sourceLang && targetLang && sourceLang !== targetLang) {
        setState((prev) => ({ ...prev, isTranslatingChunk: true }));
        try {
          const response = await fetch("/api/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: textToSpeak,
              sourceLanguage: sourceLang,
              targetLanguage: targetLang,
            }),
          });

          if (session !== sessionRef.current) return;

          if (response.ok) {
            const data = await response.json();
            textToSpeak = data.translatedText;
          } else {
            console.warn(`Translation failed for chunk index ${index}, falling back to original text.`);
          }
        } catch (err) {
          if (session !== sessionRef.current) return;
          console.warn(`Network/translation error on chunk index ${index}, falling back to original text.`, err);
        } finally {
          if (session !== sessionRef.current) return;
          setState((prev) => ({ ...prev, isTranslatingChunk: false }));
        }
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utteranceRef.current = utterance;

      if (state.selectedVoice) {
        utterance.voice = state.selectedVoice;
      }
      utterance.rate = state.speechRate;

      utterance.onend = () => {
        if (session !== sessionRef.current) return;
        currentIndexRef.current = index + 1;
        playChunkRef.current(currentIndexRef.current, session, sourceLang, targetLang);
      };

      utterance.onerror = (event) => {
        if (session !== sessionRef.current) return;
        
        // Log non-user cancelled errors
        if (event.error !== "interrupted") {
          console.error(`SpeechSynthesis error on chunk ${index}:`, event);
        }

        // Gracefully recover: move to next chunk
        currentIndexRef.current = index + 1;
        playChunkRef.current(currentIndexRef.current, session, sourceLang, targetLang);
      };

      utterance.onpause = () => {
        if (session !== sessionRef.current) return;
        setState((prev) => ({ ...prev, isPaused: true }));
      };

      utterance.onresume = () => {
        if (session !== sessionRef.current) return;
        setState((prev) => ({ ...prev, isPlaying: true, isPaused: false }));
      };

      synth.speak(utterance);
    },
    [getSynth, state.selectedVoice, state.speechRate]
  );

  // Keep recursive function pointer reference updated
  useEffect(() => {
    playChunkRef.current = playChunk;
  }, [playChunk]);

  const speak = useCallback(
    (text: string, maxChunkSize: number = 200, sourceLang?: string, targetLang?: string) => {
      const synth = getSynth();
      if (!synth || !text.trim()) return;

      // Invalidate previous session
      sessionRef.current++;
      const currentSession = sessionRef.current;

      synth.cancel();

      // Chunk the text using the chunkText utility
      const chunks = chunkText(text, maxChunkSize);
      chunksRef.current = chunks;
      currentIndexRef.current = 0;

      if (chunks.length === 0) {
        stop();
        return;
      }

      // Begin playing first chunk in queue
      playChunk(0, currentSession, sourceLang, targetLang);
    },
    [getSynth, playChunk, stop]
  );

  const setVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    setState((prev) => ({ ...prev, selectedVoice: voice }));
  }, []);

  const setRate = useCallback((rate: number) => {
    setState((prev) => ({ ...prev, speechRate: rate }));
  }, []);

  return {
    ...state,
    speak,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
  };
}
