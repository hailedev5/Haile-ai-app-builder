import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Cmd/Ctrl + K', description: 'Open Universal Command Palette' },
    { key: 'Cmd/Ctrl + Enter', description: 'Send current message' },
    { key: 'Shift + Enter', description: 'Insert new line in input' },
    { key: 'Cmd/Ctrl + Shift + N', description: 'Start a new conversation session' },
    { key: 'Cmd/Ctrl + Shift + S', description: 'Toggle conversation history sidebar' },
    { key: 'Cmd/Ctrl + Shift + C', description: 'Open / Close Canvas Studio workspace' },
    { key: 'Cmd/Ctrl + Shift + T', description: 'Open Prompt & Workflow Library' },
    { key: 'Cmd/Ctrl + /', description: 'Open this Keyboard Shortcuts cheat sheet' },
    { key: 'Escape', description: 'Close any active modal or dropdown' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Keyboard Shortcuts</h2>
              <p className="text-xs text-zinc-400">Power-user keyboard bindings</p>
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

        {/* Shortcuts list */}
        <div className="p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-b-0 text-xs"
            >
              <span className="text-zinc-300">{s.description}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700/80 font-mono text-amber-400 font-semibold text-[11px] shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/40 text-center text-[11px] text-zinc-500 font-mono">
          Press ESC at any time to return to chat
        </div>
      </div>
    </div>
  );
};
