"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export interface SpeechSynthesisState {
  isPlaying: boolean;
  isPaused: boolean;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  speechRate: number;
}

export function useSpeechSynthesis() {
  const [state, setState] = useState<SpeechSynthesisState>({
    isPlaying: false,
    isPaused: false,
    availableVoices: [],
    selectedVoice: null,
    speechRate: 1,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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
    if (!synth) return;

    // Load voices on next tick to avoid calling setState synchronously during rendering/effect phase
    const timeoutId = setTimeout(() => {
      loadVoices();
    }, 0);

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
      // Stop speech on unmount to clean up resources
      synth.cancel();
    };
  }, [getSynth, loadVoices]);

  const stop = useCallback(() => {
    const synth = getSynth();
    if (!synth) return;
    synth.cancel();
    setState((prev) => ({ ...prev, isPlaying: false, isPaused: false }));
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

  const speak = useCallback(
    (text: string) => {
      const synth = getSynth();
      if (!synth || !text.trim()) return;

      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      if (state.selectedVoice) {
        utterance.voice = state.selectedVoice;
      }
      utterance.rate = state.speechRate;

      utterance.onstart = () => {
        setState((prev) => ({ ...prev, isPlaying: true, isPaused: false }));
      };

      utterance.onend = () => {
        setState((prev) => ({ ...prev, isPlaying: false, isPaused: false }));
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        if (event.error !== "interrupted") {
          console.error("SpeechSynthesisUtterance error:", event);
        }
        setState((prev) => ({ ...prev, isPlaying: false, isPaused: false }));
        utteranceRef.current = null;
      };

      utterance.onpause = () => {
        setState((prev) => ({ ...prev, isPaused: true }));
      };

      utterance.onresume = () => {
        setState((prev) => ({ ...prev, isPlaying: true, isPaused: false }));
      };

      synth.speak(utterance);
    },
    [getSynth, state.selectedVoice, state.speechRate]
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
