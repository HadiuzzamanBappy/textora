import React, { useState, useRef } from "react";
import { Trash2, Type, Languages, ChevronDown, ChevronUp, Upload, FileText } from "lucide-react";
import { cn } from "../utils/cn";
import { toast } from "sonner";
import { SUPPORTED_LANGUAGES } from "../utils/languages";

interface DocumentReaderProps {
  sourceText: string;
  setSourceText: (text: string) => void;
  translatedText?: string;
  isPlaying: boolean;
  isTranslating: boolean;
  handleClear: () => void;
  showTranscript: boolean;
  setShowTranscript: (show: boolean) => void;
  translationEnabled: boolean;
  targetLang: string;
}

export function DocumentReader({
  sourceText,
  setSourceText,
  translatedText,
  isPlaying,
  isTranslating,
  handleClear,
  showTranscript,
  setShowTranscript,
  translationEnabled,
  targetLang,
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
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 relative z-10 transition-all duration-500">
      
      {/* Main Document Input */}
      <div 
        className={cn(
          "bg-[var(--bg-card)] border rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col gap-4 relative overflow-hidden group transition-all duration-300",
          isDragging ? "border-indigo-500/80 bg-indigo-500/5 shadow-indigo-500/20 scale-[1.01]" : "border-[var(--border-card)] hover:shadow-indigo-500/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-500" />
        
        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-card)]/80 backdrop-blur-sm border-2 border-dashed border-indigo-500/50 rounded-2xl pointer-events-none animate-in fade-in duration-200">
            <div className="p-4 bg-indigo-500/10 rounded-full mb-3">
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-lg font-bold text-indigo-400">Drop your file here</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Accepts .txt, .md, .csv</p>
          </div>
        )}

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-md shadow-sm">
              <Type className="w-4 h-4 text-indigo-400" />
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:text-indigo-400 hover:border-indigo-500/40 transition-all text-xs font-medium cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload File
            </button>
            <button
              onClick={handleClear}
              disabled={isPlaying || isTranslating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-transparent text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all text-xs font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>

        <textarea
          aria-label="Document Text"
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          disabled={isPlaying || isTranslating}
          className="w-full flex-1 min-h-[250px] max-h-[50vh] bg-transparent border-none p-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-0 resize-y text-lg leading-relaxed disabled:opacity-60 relative z-10 custom-scrollbar font-serif"
          placeholder="Paste your text here to begin reading..."
        />

        <div className="flex items-center justify-end border-t border-[var(--border-input)] pt-3 relative z-10">
          <span className="text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-input)] px-2.5 py-1 rounded-md border border-[var(--border-input)] shadow-sm">
            {sourceText.length.toLocaleString()} chars
          </span>
        </div>
      </div>

      {/* Optional Transcript view if translation is enabled */}
      {translationEnabled && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 backdrop-blur-sm shadow-md flex flex-col gap-4 relative overflow-hidden transition-all duration-300">
          <button 
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center justify-between w-full focus:outline-none group/btn"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-md shadow-sm">
                <Languages className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)] group-hover/btn:text-[var(--text-primary)] transition-colors">
                Live {languageName} Transcript
              </span>
            </div>
            <div className="text-[var(--text-secondary)] group-hover/btn:text-[var(--text-primary)] p-1 rounded-full bg-[var(--bg-input)] border border-[var(--border-input)] transition-all">
              {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showTranscript && (
            <div className="mt-2 pt-4 border-t border-[var(--border-input)] animate-in slide-in-from-top-4 fade-in duration-300">
              <textarea
                readOnly
                value={translatedText || ""}
                className="w-full min-h-[20vh] bg-transparent border-none text-[var(--text-primary)] text-base leading-relaxed resize-none focus:outline-none custom-scrollbar italic opacity-90"
                placeholder="The translated text will appear here as it is being processed..."
              />
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}
