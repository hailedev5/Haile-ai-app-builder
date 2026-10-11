import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Play, Sparkles } from 'lucide-react';
import { Artifact } from '../types';

interface CanvasStudioProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: Artifact | null;
  onUpdateArtifact: (updated: Artifact) => void;
  onOpenRunner: (code: string, language: string) => void;
}

export const CanvasStudio: React.FC<CanvasStudioProps> = ({
  isOpen,
  onClose,
  artifact,
  onUpdateArtifact,
  onOpenRunner,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !artifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let extension = 'txt';
    if (artifact.language.includes('javascript') || artifact.language.includes('js')) extension = 'js';
    else if (artifact.language.includes('typescript') || artifact.language.includes('ts')) extension = 'ts';
    else if (artifact.language.includes('python') || artifact.language.includes('py')) extension = 'py';
    else if (artifact.language.includes('html')) extension = 'html';
    else if (artifact.language.includes('svg')) extension = 'svg';
    else if (artifact.language.includes('json')) extension = 'json';
    else if (artifact.language.includes('markdown') || artifact.language.includes('md')) extension = 'md';

    const blob = new Blob([artifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${artifact.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const wordCount = artifact.content.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = artifact.content.split('\n').length;

  return (
    <aside className="w-full md:w-[480px] lg:w-[560px] h-full flex flex-col bg-zinc-950 border-l border-zinc-800 shadow-2xl z-20 shrink-0">
      {/* Top Header */}
      <div className="h-15 px-4 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
            <FileCode className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <input
              type="text"
              value={artifact.title}
              onChange={(e) => onUpdateArtifact({ ...artifact, title: e.target.value })}
              className="font-semibold text-sm text-zinc-100 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 rounded px-1 truncate w-full"
              placeholder="Artifact Title"
            />
            <p className="text-[11px] text-zinc-400 font-mono">
              {artifact.language} • {lineCount} lines • {wordCount} words
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Run Preview if executable */}
          <button
            type="button"
            onClick={() => onOpenRunner(artifact.content, artifact.language)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-colors"
            title="Run interactive sandbox"
          >
            <Play className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Run</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Copy content"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Close Canvas Studio"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 p-3">
        <div className="flex-1 rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-3 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              Live Workspace Editor
            </span>
            <span className="text-[11px] text-zinc-500">Auto-saved</span>
          </div>
          <textarea
            value={artifact.content}
            onChange={(e) => onUpdateArtifact({ ...artifact, content: e.target.value })}
            className="flex-1 w-full mt-2 font-mono text-xs md:text-sm bg-transparent text-zinc-200 resize-none focus:outline-none selection:bg-amber-500/30 overflow-auto leading-relaxed"
            placeholder="Type or paste code / document here..."
            spellCheck={false}
          />
        </div>
      </div>
    </aside>
  );
};
