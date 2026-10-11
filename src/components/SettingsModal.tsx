import React from 'react';
import { X, Sliders, Volume2, Sparkles, Trash2, Cpu, Globe, Brain, Zap } from 'lucide-react';
import { AppSettings, GeminiModelId, Persona } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetAllData: () => void;
  onDeleteCustomPersona?: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetAllData,
  onDeleteCustomPersona,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-zinc-100 font-display">
                Haile AI Configuration
              </h2>
              <p className="text-xs text-zinc-400">Customize behavior and preferences</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Form */}
        <div className="space-y-4 text-sm">
          {/* Default Model */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">
              Default Gemini Reasoning Engine
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'gemini-3.8-flash', label: '3.8 Flash', tag: 'Fast • High-IQ' },
                  { id: 'gemini-2.5-flash', label: '2.5 Flash', tag: 'Balanced' },
                  { id: 'gemini-2.5-pro', label: '2.5 Pro', tag: 'Deep Logic' },
                ] as { id: GeminiModelId; label: string; tag: string }[]
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onUpdateSettings({ defaultModel: m.id })}
                  className={`p-2 rounded-xl text-xs border text-left transition-colors ${
                    settings.defaultModel === m.id
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                  }`}
                >
                  <p>{m.label}</p>
                  <p className="text-[10px] text-zinc-500">{m.tag}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Web Search & Deep Thinking Defaults */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Web Grounding</p>
                  <p className="text-[10px] text-zinc-500">Live Google search</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.webSearchDefault}
                onChange={(e) => onUpdateSettings({ webSearchDefault: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Deep Thinking</p>
                  <p className="text-[10px] text-zinc-500">Chain-of-thought</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.deepThinkingDefault}
                onChange={(e) => onUpdateSettings({ deepThinkingDefault: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Custom Directives */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-zinc-300 block">
              Custom Directives for Haile AI
            </label>
            <textarea
              rows={3}
              value={settings.customDirectives}
              onChange={(e) => onUpdateSettings({ customDirectives: e.target.value })}
              placeholder="e.g. 'I am an engineering founder. Keep explanations focused on scalable TypeScript code and provide architecture diagrams when helpful.'"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
            />
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300">Creativity & Variance (Temperature)</span>
              <span className="font-mono text-amber-400">{settings.temperature}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.temperature}
              onChange={(e) => onUpdateSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 bg-zinc-900 rounded-lg cursor-pointer"
            />
          </div>

          {/* Voice & Sound settings */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-200">Auto-Speak Responses</p>
                <p className="text-[11px] text-zinc-400">Read Haile AI answers aloud automatically</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) => onUpdateSettings({ autoSpeak: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-200">Subtle Sound FX</p>
                <p className="text-[11px] text-zinc-400">Audio feedback on message send and receive</p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => onUpdateSettings({ soundEffects: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Custom Personas List */}
          {settings.customPersonas && settings.customPersonas.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="text-xs font-semibold text-zinc-300 block">
                Saved Custom Personas ({settings.customPersonas.length})
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {settings.customPersonas.map((cp) => (
                  <div
                    key={cp.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-zinc-200">{cp.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate max-w-xs">{cp.tagline}</p>
                    </div>
                    {onDeleteCustomPersona && (
                      <button
                        type="button"
                        onClick={() => onDeleteCustomPersona(cp.id)}
                        className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                        title="Delete custom persona"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger zone: Clear data */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-400">Clear All History</p>
              <p className="text-[11px] text-zinc-400">Delete all saved sessions from browser</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to delete all saved conversations?')) {
                  onResetAllData();
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
