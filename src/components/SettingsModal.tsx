import React from 'react';
import { X, Sliders, Volume2, Sparkles, Trash2 } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetAllData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-850">
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
            id="close-settings-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Form */}
        <div className="space-y-5 text-sm">
          {/* Custom Directives */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">
              Custom Directives for Haile AI
            </label>
            <textarea
              rows={3}
              value={settings.customDirectives}
              onChange={(e) => onUpdateSettings({ customDirectives: e.target.value })}
              placeholder="e.g. 'I am an engineering founder. Keep explanations focused on scalable TypeScript code and provide architecture diagrams when helpful.'"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 resize-none"
            />
            <p className="text-[11px] text-zinc-400">
              Injected into Haile AI's cognitive system prompt for every interaction.
            </p>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1.5">
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
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>Precise & Analytical (0.1)</span>
              <span>Visionary & Lateral (1.0)</span>
            </div>
          </div>

          {/* Voice & Sound settings */}
          <div className="space-y-3 pt-3 border-t border-zinc-850">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-200">Auto-Speak Responses</p>
                <p className="text-[11px] text-zinc-400">
                  Read Haile AI answers aloud automatically
                </p>
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

            {/* Voice Speed */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">Voice Speech Speed</span>
                <span className="font-mono text-amber-400">{settings.voiceSpeed}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={settings.voiceSpeed}
                onChange={(e) => onUpdateSettings({ voiceSpeed: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 bg-zinc-900 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Danger zone: Clear data */}
          <div className="pt-3 border-t border-zinc-850 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-400">Clear All History</p>
              <p className="text-[11px] text-zinc-400">Delete all saved sessions from browser</p>
            </div>
            <button
              id="reset-all-history-btn"
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
            className="px-4 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
