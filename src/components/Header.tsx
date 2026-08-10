"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Settings, Moon, Sun, Info } from "lucide-react";
import { cn } from "../utils/cn";

interface HeaderProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  onOpenSettings: () => void;
}

export function Header({ theme, toggleTheme, onOpenSettings }: HeaderProps) {
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setShowInfo(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <header className="border-b border-[var(--border-bottom)] bg-[var(--bg-header)] backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 md:px-0 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative group flex items-center justify-center -ml-1">
            <Image
              src="/logo.png"
              alt="Textora Logo"
              fill
              sizes="40px"
              className="object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
              priority
            />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
            Textora
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div 
            className="relative flex items-center" 
            ref={infoRef}
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
          >
            <button
              onClick={() => setShowInfo(!showInfo)}
              aria-label="Platform Limitations & Diagnostics"
              className={cn(
                "p-2.5 rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-orange-400 hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] transition-all cursor-pointer group",
                showInfo && "text-orange-400 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
              )}
            >
              <Info className={cn("w-4.5 h-4.5 transition-transform duration-500 group-hover:scale-110", showInfo && "scale-110")} />
            </button>
            
            {/* Flyout menu */}
            <div className={cn(
              "fixed left-4 right-4 top-20 md:absolute md:top-full md:left-auto md:right-0 md:pt-3 opacity-0 -translate-y-2 pointer-events-none transition-all duration-300 z-50 md:w-80",
              showInfo && "opacity-100 translate-y-0 pointer-events-auto"
            )}>
              <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl shadow-xl overflow-hidden flex flex-col backdrop-blur-xl">
                <div className="p-4 bg-orange-500/10 border-b border-orange-500/20">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    <Info className="w-3.5 h-3.5" />
                    Limitations & Diagnostics
                  </span>
                </div>
                <div className="p-5 text-xs text-[var(--text-secondary)] space-y-4 leading-relaxed">
                  <p>
                    <strong className="text-[var(--text-primary)]">TTS Engine:</strong> Browser-native audio synthesis runs locally via the Web Speech API.
                  </p>
                  <ul className="pl-4 space-y-2 list-disc marker:text-orange-500">
                    <li>
                      <strong className="text-[var(--text-primary)]">iOS Safari / Chrome:</strong> Apple restricts automatic audio playback.
                    </li>
                    <li>
                      <strong className="text-[var(--text-primary)]">Voice Options:</strong> Voices are device-specific.
                    </li>
                    <li>
                      <strong className="text-[var(--text-primary)]">Keyless Translation:</strong> Utilizes your browser&apos;s native API or falls back to a free provider.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2.5 rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-amber-400 hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(251,191,36,0.15)] transition-all cursor-pointer group"
          >
            <div className="relative w-4.5 h-4.5">
              <Sun
                className={cn(
                  "absolute inset-0 w-full h-full transition-all duration-500 transform",
                  theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                )}
              />
              <Moon
                className={cn(
                  "absolute inset-0 w-full h-full transition-all duration-500 transform",
                  theme === "light" ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                )}
              />
            </div>
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="p-2.5 rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-rose-400 hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all cursor-pointer group"
          >
            <Settings className="w-4.5 h-4.5 transition-transform duration-500 group-hover:rotate-90" />
          </button>
        </div>
      </div>
    </header>
  );
}
