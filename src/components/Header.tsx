import React from "react";
import Image from "next/image";
import { Settings, Moon, Sun } from "lucide-react";
import { cn } from "../utils/cn";

interface HeaderProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  onOpenSettings: () => void;
}

export function Header({ theme, toggleTheme, onOpenSettings }: HeaderProps) {
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
          <button
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="p-2.5 rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-rose-400 hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all cursor-pointer group"
          >
            <Settings className="w-4.5 h-4.5 transition-transform duration-500 group-hover:rotate-90" />
          </button>

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
        </div>
      </div>
    </header>
  );
}
