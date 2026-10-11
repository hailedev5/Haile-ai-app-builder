import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2, Check, UserPlus } from 'lucide-react';
import { Persona } from '../types';

interface CustomPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomPersona: (persona: Persona) => void;
}

export const CustomPersonaModal: React.FC<CustomPersonaModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomPersona,
}) => {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [colorTheme, setColorTheme] = useState<'cyan' | 'emerald' | 'amber' | 'purple' | 'rose'>('cyan');

  if (!isOpen) return null;

  const colorThemes = {
    cyan: {
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      accentGradient: 'from-cyan-400 to-blue-600',
    },
    emerald: {
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      accentGradient: 'from-emerald-400 to-teal-600',
    },
    amber: {
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      accentGradient: 'from-amber-400 to-orange-600',
    },
    purple: {
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      accentGradient: 'from-purple-400 to-pink-600',
    },
    rose: {
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      accentGradient: 'from-rose-400 to-red-600',
    },
  };

  const handleSave = () => {
    if (!name.trim() || !systemPrompt.trim()) return;

    const newPersona: Persona = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.startsWith('Haile ') ? name : `Haile ${name}`,
      tagline: tagline.trim() || 'Custom Specialized Intelligence',
      description: description.trim() || 'User-tailored cognitive directives and behavioral architecture.',
      icon: 'Sparkles',
      badgeColor: colorThemes[colorTheme].badgeColor,
      accentGradient: colorThemes[colorTheme].accentGradient,
      temperature,
      samplePrompts: [
        'How can you assist me in this mode?',
        'Demonstrate your specialized perspective on a problem',
      ],
      isCustom: true,
      systemPrompt: systemPrompt.trim(),
    };

    onSaveCustomPersona(newPersona);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                Custom Persona Architect
              </h2>
              <p className="text-xs text-zinc-400">
                Design your own tailored Haile AI cognitive persona with specific instructions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Persona Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Polyglot, Quantum Tutor, Tech Lead"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Nuanced Multilingual & Dialect Expert"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Short Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Crafts translations with deep cultural context and idioms."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                System Directives & Behavioral Prompt
              </label>
              <span className="text-[11px] text-zinc-500">Core Persona Guidance</span>
            </div>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={5}
              placeholder="Define how Haile should act, tone of voice, preferred response format, and domain specialization..."
              className="w-full p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500/50 resize-none font-mono text-xs leading-relaxed"
            />
          </div>

          {/* Color theme & Temperature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Color Accent Theme
              </label>
              <div className="flex items-center gap-2">
                {(Object.keys(colorThemes) as (keyof typeof colorThemes)[]).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setColorTheme(theme)}
                    className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
                      colorTheme === theme
                        ? 'border-white scale-110 shadow-md'
                        : 'border-zinc-700 opacity-60 hover:opacity-100'
                    } ${
                      theme === 'cyan'
                        ? 'bg-cyan-500'
                        : theme === 'emerald'
                        ? 'bg-emerald-500'
                        : theme === 'amber'
                        ? 'bg-amber-500'
                        : theme === 'purple'
                        ? 'bg-purple-500'
                        : 'bg-rose-500'
                    }`}
                  >
                    {colorTheme === theme && <Check className="w-3.5 h-3.5 text-zinc-950 font-bold" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-zinc-400">Creativity / Temperature</span>
                <span className="font-mono text-cyan-400">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!name.trim() || !systemPrompt.trim()}
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              name.trim() && systemPrompt.trim()
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 hover:brightness-110 shadow-md shadow-cyan-500/20'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Persona</span>
          </button>
        </div>
      </div>
    </div>
  );
};
