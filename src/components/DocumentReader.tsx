import React, { useState, useRef } from "react";
import { Trash2, Type, Languages, Upload, FileText } from "lucide-react";
import { cn } from "../utils/cn";
import { toast } from "sonner";
import { SUPPORTED_LANGUAGES } from "../utils/languages";
import { chunkText } from "../utils/textChunker";

interface DocumentReaderProps {
  sourceText: string;
  setSourceText: (text: string) => void;
  translatedText?: string;
  isPlaying: boolean;
  isTranslating: boolean;
  handleClear: () => void;
  translationEnabled: boolean;
  targetLang: string;
  currentChunk?: number;
  maxChunkSize?: number;
  sourceLang: string;
  voiceLang: string;
}

export function DocumentReader({
  sourceText,
  setSourceText,
  translatedText,
  isPlaying,
  isTranslating,
  handleClear,
  translationEnabled,
  targetLang,
  sourceLang,
  voiceLang,
  currentChunk = 0,
  maxChunkSize = 200,
}: DocumentReaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languageName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || "Translation";

  const processFile = (file: File) => {
    // Basic check for text-like files
    const validExtensions = [".txt", ".md", ".csv", ".json"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const isTextFile = file.type.startsWith("text/") || validExtensions.includes(fileExtension);

    if (!isTextFile) {
      toast.error("Unsupported file type", {
        description: "Please upload a plain text file (.txt, .md, .csv). PDF and Word documents are not supported.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("File is too large", {
        description: "Please keep files under 5MB for optimal browser performance.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        setSourceText(text);
        toast.success("File uploaded successfully");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read the file");
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isPlaying && !isTranslating) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (isPlaying || isTranslating) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
      // Reset input so the same file can be uploaded again if needed
      e.target.value = "";
    }
  };

  const handleUploadClick = () => {
    if (isPlaying || isTranslating) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={cn(
      "w-full mx-auto gap-6 relative z-10 transition-all duration-500",
      translationEnabled
        ? "flex flex-col lg:flex-row justify-center items-stretch"
        : "flex flex-col max-w-4xl"
    )}>

      {/* Main Document Input */}
      <div
        className={cn(
          "bg-[var(--bg-card)] border rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col gap-4 relative overflow-hidden group transition-all duration-300",
          translationEnabled ? "w-full lg:w-[640px]" : "w-full",
          isDragging ? "border-rose-500/80 bg-rose-500/5 shadow-rose-500/20 scale-[1.01]" : "border-[var(--border-card)] hover:shadow-rose-500/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-rose-500/10 transition-colors duration-500" />

        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-card)]/80 backdrop-blur-sm border-2 border-dashed border-rose-500/50 rounded-2xl pointer-events-none animate-in fade-in duration-200">
            <div className="p-4 bg-rose-500/10 rounded-full mb-3">
              <FileText className="w-8 h-8 text-rose-400" />
            </div>
            <p className="text-lg font-bold text-rose-400">Drop your file here</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Accepts .txt, .md, .csv</p>
          </div>
        )}

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-md shadow-sm">
              <Type className="w-4 h-4 text-rose-400" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
              Document
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              className="hidden"
              accept=".txt,.md,.csv,.json,text/*"
            />
            <button
              onClick={handleUploadClick}
              disabled={isPlaying || isTranslating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:text-rose-400 hover:border-rose-500/40 transition-all text-xs font-medium cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload File
            </button>
            <button
              onClick={handleClear}
              disabled={isPlaying || isTranslating || !sourceText.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-transparent text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>

        {isPlaying ? (
          <div className="w-full flex-1 min-h-[250px] max-h-[50vh] bg-transparent border-none p-2 text-lg leading-relaxed relative z-10 custom-scrollbar font-serif overflow-y-auto whitespace-pre-wrap">
            {chunkText(sourceText, maxChunkSize).map((chunk, index) => (
              <span
                key={index}
                className={cn(
                  "transition-colors duration-300 rounded-[4px] px-0.5",
                  index === currentChunk - 1
                    ? "bg-rose-500/20 dark:bg-rose-500/30 text-rose-900 dark:text-rose-100 font-semibold shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                    : "text-[var(--text-primary)] opacity-80"
                )}
              >
                {chunk}{" "}
              </span>
            ))}
          </div>
        ) : (
          <textarea
            aria-label="Document Text"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            disabled={isPlaying || isTranslating}
            className="w-full flex-1 min-h-[250px] max-h-[50vh] bg-transparent border-none p-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-0 resize-y text-lg leading-relaxed disabled:opacity-60 relative z-10 custom-scrollbar font-serif"
            placeholder="Paste your text here to begin reading..."
          />
        )}

        <div className="flex flex-wrap items-center justify-between border-t border-[var(--border-input)] pt-3 relative z-10 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase px-2 py-0.5 rounded-md bg-[var(--bg-input)] border border-[var(--border-input)]">
              {sourceLang === "auto" 
                ? `Detected: ${SUPPORTED_LANGUAGES.find((l) => l.code === voiceLang)?.name || voiceLang}`
                : SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang)?.name || sourceLang}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase px-2 py-0.5 rounded-md bg-[var(--bg-input)] border border-[var(--border-input)]">
              {sourceText.trim() ? sourceText.trim().split(/\s+/).length.toLocaleString() : 0} words
            </span>
            <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase px-2 py-0.5 rounded-md bg-[var(--bg-input)] border border-[var(--border-input)]">
              ~{Math.max(1, Math.ceil((sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0) / 150))} min read
            </span>
            <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase px-2 py-0.5 rounded-md bg-[var(--bg-input)] border border-[var(--border-input)]">
              {sourceText.length.toLocaleString()} chars
            </span>
          </div>
        </div>
      </div>

      {/* Optional Transcript view if translation is enabled */}
      {translationEnabled && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col gap-4 relative overflow-hidden transition-all duration-300 w-full lg:w-[400px]">

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-md shadow-sm">
                <Languages className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                {languageName} Transcript
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col relative z-10">
            {isPlaying ? (
              <div className="w-full flex-1 min-h-[250px] max-h-[50vh] overflow-y-auto bg-transparent border-none p-2 text-base leading-relaxed focus:outline-none custom-scrollbar italic opacity-90 whitespace-pre-wrap">
                {chunkText(translatedText || "", maxChunkSize).map((chunk, index) => (
                  <span
                    key={index}
                    className={cn(
                      "transition-colors duration-300 rounded-[4px] px-0.5",
                      index === currentChunk - 1
                        ? "bg-orange-500/20 dark:bg-orange-500/30 text-orange-900 dark:text-orange-100 font-semibold shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                        : ""
                    )}
                  >
                    {chunk}{" "}
                  </span>
                ))}
              </div>
            ) : (
              <textarea
                readOnly
                value={translatedText || ""}
                className="w-full flex-1 min-h-[250px] max-h-[50vh] bg-transparent border-none p-2 text-[var(--text-primary)] text-base leading-relaxed resize-none focus:outline-none custom-scrollbar italic opacity-90"
                placeholder="The translated text will appear here as it is being processed..."
              />
            )}
          </div>

          <div className="flex items-center justify-end border-t border-[var(--border-input)] pt-3 relative z-10">
            <span className="text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-input)] px-2.5 py-1 rounded-md border border-[var(--border-input)] shadow-sm">
              {(translatedText || "").length.toLocaleString()} chars
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
