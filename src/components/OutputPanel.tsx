import React from "react";
import { Languages, FileText } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../utils/languages";

interface OutputPanelProps {
  translatedText: string;
  setTranslatedText: (text: string) => void;
  targetLang: string;
  setTargetLang: (lang: string) => void;
  setVoiceLang: (lang: string) => void;
  isPlaying: boolean;
  isTranslating: boolean;
}

export function OutputPanel({
  translatedText,
  setTranslatedText,
  targetLang,
  setTargetLang,
  setVoiceLang,
  isPlaying,
  isTranslating,
}: OutputPanelProps) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 backdrop-blur-sm flex flex-col gap-4 shadow-xl transition-all duration-300 hover:shadow-purple-500/5 group relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-purple-500/10 transition-colors duration-500" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-md shadow-sm">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Translation Output
          </span>
        </div>
        
        <div className="relative group/select">
          <select
            aria-label="Target Language Selector"
            value={targetLang}
            onChange={(e) => {
              setTargetLang(e.target.value);
              setVoiceLang(e.target.value);
            }}
            disabled={isPlaying || isTranslating}
            className="appearance-none bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-secondary)] text-xs font-medium rounded-xl pl-8 pr-8 py-2 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 cursor-pointer disabled:opacity-50 transition-all shadow-sm hover:border-purple-500/40"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={`target-${lang.code}`} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-purple-400">
            <Languages className="w-4 h-4" />
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-[var(--text-secondary)] group-hover/select:text-[var(--text-primary)] transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <textarea
        aria-label="Translated Text Output"
        value={translatedText}
        onChange={(e) => setTranslatedText(e.target.value)}
        className="w-full flex-1 min-h-[240px] bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl p-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none text-sm leading-relaxed shadow-inner relative z-10 custom-scrollbar"
        placeholder="Translated text will appear here. Or trigger the progressive pipeline below to translate and play sequentially on-the-fly."
      />

      <div className="flex items-center justify-between border-t border-[var(--border-input)] pt-4 mt-1 text-xs text-[var(--text-muted)] relative z-10">
        <span className="font-mono bg-[var(--bg-input)] px-2 py-1 rounded-md border border-[var(--border-input)] shadow-sm">
          {translatedText.length.toLocaleString()} chars
        </span>
        <span className="flex items-center gap-1.5 opacity-80">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit output directly if desired
        </span>
      </div>
    </div>
  );
}
