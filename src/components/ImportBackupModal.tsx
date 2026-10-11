import React, { useState, useRef } from 'react';
import { X, Upload, Check, AlertCircle, FileText, Download } from 'lucide-react';
import { ChatSession, Persona } from '../types';

interface ImportBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedSessions: ChatSession[], importedPersonas?: Persona[]) => void;
}

export const ImportBackupModal: React.FC<ImportBackupModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [fileData, setFileData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        // Can be array of sessions, or { sessions, customPersonas } or single session
        if (Array.isArray(parsed)) {
          setFileData({ sessions: parsed });
        } else if (parsed && Array.isArray(parsed.sessions)) {
          setFileData(parsed);
        } else if (parsed && parsed.id && parsed.messages) {
          // single session JSON
          setFileData({ sessions: [parsed] });
        } else {
          throw new Error('Unrecognized Haile AI backup structure.');
        }
      } catch (err: any) {
        setError(err.message || 'Invalid JSON backup file.');
        setFileData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (!fileData || !fileData.sessions) return;
    onImportSuccess(fileData.sessions, fileData.customPersonas);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Import & Restore Backup</h2>
              <p className="text-xs text-zinc-400">Restore conversations and custom personas from JSON.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />

          {!fileData ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-zinc-800 hover:border-amber-500/50 rounded-2xl bg-zinc-900/40 text-center cursor-pointer transition-colors space-y-3"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-200">Click to choose a Haile backup file</p>
                <p className="text-xs text-zinc-500 mt-1">Accepts .json exported files</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">Sessions Found:</span>
                <span className="font-mono text-amber-400 font-bold">{fileData.sessions.length}</span>
              </div>
              {fileData.customPersonas && (
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">Custom Personas:</span>
                  <span className="font-mono text-cyan-400 font-bold">{fileData.customPersonas.length}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setFileData(null)}
                className="text-xs text-amber-400 hover:underline pt-1 inline-block"
              >
                Choose a different file
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!fileData}
            onClick={handleExecuteImport}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              fileData
                ? 'bg-amber-500 text-zinc-950 hover:brightness-110 shadow'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            Restore Conversations
          </button>
        </div>
      </div>
    </div>
  );
};
