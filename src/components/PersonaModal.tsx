import React from 'react';
import {
  X,
  Sparkles,
  Cpu,
  Zap,
  Compass,
  ShieldCheck,
  Check,
  ArrowRight,
} from 'lucide-react';
import { PersonaId, Persona } from '../types';
import { HAILE_PERSONAS } from '../data/personas';
import { HaileLogo } from './HaileLogo';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: PersonaId;
  onSelectPersona: (persona: PersonaId) => void;
  onSelectPrompt: (prompt: string, persona: PersonaId) => void;
  customPersonas?: Persona[];
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  currentPersona,
  onSelectPersona,
  onSelectPrompt,
  customPersonas = [],
}) => {
  if (!isOpen) return null;

  const allPersonas = [...HAILE_PERSONAS, ...customPersonas];

  const getPersonaIcon = (id: PersonaId) => {
    switch (id) {
      case 'genius':
        return <Cpu className="w-5 h-5 text-amber-400" />;
      case 'speed':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'creative':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'sage':
        return <Compass className="w-5 h-5 text-blue-400" />;
      case 'executive':
        return <ShieldCheck className="w-5 h-5 text-rose-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HaileLogo size="md" />
            <div>
              <h2 className="font-bold text-base text-zinc-100 font-display">
                Haile AI Cognitive Personas
              </h2>
              <p className="text-xs text-zinc-400">
                Switch cognitive models to tailor Haile's reasoning style and depth
              </p>
            </div>
          </div>

          <button
            id="close-persona-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Personas List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {allPersonas.map((p) => {
            const isSelected = p.id === currentPersona;
            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-zinc-900/90 border-amber-500/50 ring-1 ring-amber-500/30 shadow-lg shadow-black/40'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${p.badgeColor}`}
                    >
                      {getPersonaIcon(p.id)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-zinc-100">{p.name}</h3>
                        <span
                          className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${p.badgeColor}`}
                        >
                          Temp: {p.temperature}
                        </span>
                      </div>
                      <p className="text-xs text-amber-300/80 font-medium">{p.tagline}</p>
                    </div>
                  </div>

                  <button
                    id={`select-persona-btn-${p.id}`}
                    type="button"
                    onClick={() => {
                      onSelectPersona(p.id);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 self-start sm:self-auto ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/30'
                        : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Active Mode</span>
                      </>
                    ) : (
                      <span>Activate Mode</span>
                    )}
                  </button>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  {p.description}
                </p>

                {/* Sample prompts */}
                <div className="pt-2 border-t border-zinc-850">
                  <p className="text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                    Signature Inquiries:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {p.samplePrompts.slice(0, 2).map((sp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          onSelectPrompt(sp, p.id);
                          onClose();
                        }}
                        className="text-left text-xs p-2 rounded-lg bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800/60 hover:border-amber-500/30 text-zinc-300 hover:text-amber-200 transition-colors flex items-center justify-between group"
                      >
                        <span className="truncate pr-2">{sp}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
