import React from 'react';
import { Sparkles, Cpu, Zap, Compass, ShieldCheck, ArrowRight } from 'lucide-react';
import { PersonaId } from '../types';
import { HAILE_PERSONAS } from '../data/personas';
import { HaileLogo } from './HaileLogo';

interface WelcomeHeroProps {
  currentPersona: PersonaId;
  onSelectPersona: (persona: PersonaId) => void;
  onSelectPrompt: (prompt: string) => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  currentPersona,
  onSelectPersona,
  onSelectPrompt,
}) => {
  const persona = HAILE_PERSONAS.find((p) => p.id === currentPersona) || HAILE_PERSONAS[0];

  const getPersonaIcon = (id: PersonaId) => {
    switch (id) {
      case 'genius':
        return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'speed':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'creative':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'sage':
        return <Compass className="w-4 h-4 text-blue-400" />;
      case 'executive':
        return <ShieldCheck className="w-4 h-4 text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center text-center">
      {/* Emblem */}
      <div className="mb-5 relative">
        <HaileLogo size="xl" />
      </div>

      {/* Greeting Title */}
      <div className="space-y-2 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Cognitive Companion</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-100 font-display">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400">Haile AI</span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Articulate reasoning, visionary ideation, and rapid execution. Choose a persona mode or ask anything to begin.
        </p>
      </div>

      {/* Persona Mode Switcher Pills */}
      <div className="w-full mb-8">
        <div className="flex items-center justify-center gap-2 flex-wrap max-w-2xl mx-auto">
          {HAILE_PERSONAS.map((p) => {
            const isSelected = p.id === currentPersona;
            return (
              <button
                id={`persona-pill-${p.id}`}
                key={p.id}
                type="button"
                onClick={() => onSelectPersona(p.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border ${
                  isSelected
                    ? 'bg-zinc-800 border-amber-500/60 text-zinc-100 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/40'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 hover:border-zinc-700'
                }`}
              >
                {getPersonaIcon(p.id)}
                <span>{p.name.replace('Haile ', '')}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Persona Brief */}
        <div className="mt-3 text-xs text-zinc-400 max-w-md mx-auto">
          <span className="text-amber-300 font-semibold">{persona.name}:</span>{' '}
          {persona.description}
        </div>
      </div>

      {/* Prompt Starter Cards */}
      <div className="w-full text-left">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 px-1 flex items-center justify-between">
          <span>Suggested Sparks for {persona.name}</span>
          <span className="text-[11px] lowercase text-zinc-500 font-normal">click to launch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {persona.samplePrompts.map((promptText, idx) => (
            <button
              id={`starter-prompt-${idx}`}
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(promptText)}
              className="group p-3.5 rounded-xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-amber-500/40 transition-all text-left flex items-start justify-between gap-3 shadow-sm hover:shadow-md hover:shadow-black/40"
            >
              <div className="space-y-1 min-w-0">
                <p className="text-xs sm:text-sm text-zinc-300 group-hover:text-zinc-100 leading-snug line-clamp-2">
                  {promptText}
                </p>
                <span className="text-[11px] text-zinc-500 group-hover:text-amber-400/80 font-mono inline-block">
                  Ask Haile &rarr;
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
