import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check, Music, Headphones } from "lucide-react";
import { cn } from "../utils/cn";

export type ExportStatus = 'idle' | 'exporting' | 'success';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportStatus: ExportStatus;
  handleExport: (format: 'mp3' | 'wav', gender: 'MALE' | 'FEMALE') => void;
}

export function ExportModal({ isOpen, onClose, exportStatus, handleExport }: ExportModalProps) {
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [format, setFormat] = useState<'mp3' | 'wav'>('mp3');
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/config/tts')
        .then(res => res.json())
        .then(data => {
          setHasApiKey(data.hasKey);
          if (!data.hasKey) {
            setGender('FEMALE');
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const onDownload = () => {
    handleExport(format, gender);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={exportStatus === 'idle' ? onClose : undefined}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            className="relative w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-card)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Export Audio</h2>
              <button
                onClick={onClose}
                disabled={exportStatus !== 'idle'}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-6">
              {/* Gender Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Voice Gender</label>
                  {!hasApiKey && (
                    <span className="text-[10px] font-medium text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md" title="Google Cloud API Key is required for male voices. Falling back to free female voice.">
                      API Key Required
                    </span>
                  )}
                </div>
                <div className={cn(
                  "flex p-1 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl relative",
                  !hasApiKey && "opacity-70 pointer-events-none"
                )}>
                  <motion.div
                    className="absolute inset-y-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded-lg shadow-sm"
                    initial={false}
                    animate={{
                      left: gender === 'MALE' ? '4px' : 'calc(50% + 2px)',
                      width: 'calc(50% - 6px)'
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                  <button
                    onClick={() => setGender('MALE')}
                    disabled={exportStatus !== 'idle' || !hasApiKey}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors disabled:opacity-50",
                      gender === 'MALE' ? "text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setGender('FEMALE')}
                    disabled={exportStatus !== 'idle' || !hasApiKey}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors disabled:opacity-50",
                      gender === 'FEMALE' ? "text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Format Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Audio Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormat('mp3')}
                    disabled={exportStatus !== 'idle'}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all disabled:opacity-50",
                      format === 'mp3'
                        ? "border-rose-500 bg-rose-500/5 text-rose-500"
                        : "border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                    )}
                  >
                    <Headphones className="w-6 h-6 mb-1" />
                    <span className="font-semibold">.MP3</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-80">Fast</span>
                  </button>
                  <button
                    onClick={() => setFormat('wav')}
                    disabled={exportStatus !== 'idle'}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all disabled:opacity-50",
                      format === 'wav'
                        ? "border-rose-500 bg-rose-500/5 text-rose-500"
                        : "border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                    )}
                  >
                    <Music className="w-6 h-6 mb-1" />
                    <span className="font-semibold">.WAV</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-80">Lossless</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-[var(--bg-input)]/50 border-t border-[var(--border-card)]">
              <button
                onClick={onDownload}
                disabled={exportStatus !== 'idle'}
                className="relative w-full h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-semibold transition-all disabled:opacity-70 shadow-lg shadow-rose-500/20"
              >
                <AnimatePresence mode="wait">
                  {exportStatus === 'idle' && (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      Download Audio
                    </motion.span>
                  )}
                  {exportStatus === 'exporting' && (
                    <motion.div
                      key="exporting"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </motion.div>
                  )}
                  {exportStatus === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1.2 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <Check className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
