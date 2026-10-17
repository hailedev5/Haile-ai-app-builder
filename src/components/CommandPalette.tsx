import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  Plus,
  Compass,
  Cpu,
  Zap,
  ShieldCheck,
  BookOpen,
  Image as ImageIcon,
  Settings,
  HelpCircle,
  FileCode,
  Globe,
  Brain,
  Volume2,
  Trash2,
} from 'lucide-react';
import { ChatSession, PersonaId, GeminiModelId } from '../types';
import { HAILE_PERSONAS } from '../data/personas';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onSelectSession: (id: string) => void;
  onNewSession: (persona?: PersonaId) => void;
  onSelectPersona: (persona: PersonaId) => void;
  onSelectModel: (model: GeminiModelId) => void;
  currentModel: GeminiModelId;
  onToggleSearchGrounding: () => void;
  searchGrounding: boolean;
  onToggleDeepThinking: () => void;
  deepThinking: boolean;
  onOpenTemplates: () => void;
  onOpenCanvas: () => void;
  onOpenImageGen: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  onOpenCompiler: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onNewSession,
  onSelectPersona,
  onSelectModel,
  currentModel,
  onToggleSearchGrounding,
  searchGrounding,
  onToggleDeepThinking,
  deepThinking,
  onOpenTemplates,
  onOpenCanvas,
  onOpenImageGen,
  onOpenSettings,
  onOpenShortcuts,
  onOpenCompiler,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const commands = [
    {
      id: 'cmd-new',
      label: 'New Conversation',
      description: 'Start a fresh conversation with Haile AI',
      icon: Plus,
      action: () => onNewSession(),
      badge: 'Action',
    },
    {
      id: 'cmd-compiler',
      label: '50-Language Offline Compiler',
      description: 'Compile & run Python, C, C++, Rust, Go, SQL & 50+ languages offline',
      icon: Cpu,
      action: () => onOpenCompiler(),
      badge: '50+ Langs',
    },
    {
      id: 'cmd-templates',
      label: 'Open Prompt Library',
      description: 'Browse workflows & engineering templates',
      icon: BookOpen,
      action: () => onOpenTemplates(),
      badge: 'Library',
    },
    {
      id: 'cmd-canvas',
      label: 'Open Canvas Studio / Artifacts',
      description: 'Side-by-side workspace for code & documents',
      icon: FileCode,
      action: () => onOpenCanvas(),
      badge: 'Workspace',
    },
    {
      id: 'cmd-image',
      label: 'AI Image Generation Studio',
      description: 'Generate high-res imagery & diagrams with AI',
      icon: ImageIcon,
      action: () => onOpenImageGen(),
      badge: 'Create',
    },
    {
      id: 'cmd-search',
      label: `Web Search Grounding: ${searchGrounding ? 'Enabled (ON)' : 'Disabled (OFF)'}`,
      description: 'Toggle Google Search grounding citations',
      icon: Globe,
      action: () => onToggleSearchGrounding(),
      badge: searchGrounding ? 'Active' : 'Toggle',
    },
    {
      id: 'cmd-thinking',
      label: `Deep Thinking Mode: ${deepThinking ? 'Active (ON)' : 'Inactive (OFF)'}`,
      description: 'Toggle step-by-step chain-of-thought breakdown',
      icon: Brain,
      action: () => onToggleDeepThinking(),
      badge: deepThinking ? 'Active' : 'Toggle',
    },
    {
      id: 'cmd-model-38',
      label: 'Switch to Gemini 3.8 Flash',
      description: 'Lightning-fast next-gen multimodal reasoning',
      icon: Zap,
      action: () => onSelectModel('gemini-3.8-flash'),
      badge: currentModel === 'gemini-3.8-flash' ? 'Current' : 'Model',
    },
    {
      id: 'cmd-model-25-pro',
      label: 'Switch to Gemini 2.5 Pro',
      description: 'Deepest analytical reasoning for complex logic',
      icon: Cpu,
      action: () => onSelectModel('gemini-2.5-pro'),
      badge: currentModel === 'gemini-2.5-pro' ? 'Current' : 'Model',
    },
    {
      id: 'cmd-settings',
      label: 'Open Settings & Directives',
      description: 'Configure voice, temperature, custom personas',
      icon: Settings,
      action: () => onOpenSettings(),
      badge: 'Config',
    },
    {
      id: 'cmd-shortcuts',
      label: 'Keyboard Shortcuts Cheat Sheet',
      description: 'View power-user hotkeys and commands',
      icon: HelpCircle,
      action: () => onOpenShortcuts(),
      badge: 'Help',
    },
  ];

  const filteredCommands = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-900/80">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, session title, or persona..."
            className="w-full bg-transparent text-sm md:text-base text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Commands & Actions
            </div>
            <div className="space-y-1 mt-1">
              {filteredCommands.map((cmd) => {
                const IconComponent = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl hover:bg-zinc-900 text-left flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-200 group-hover:text-amber-300">
                          {cmd.label}
                        </p>
                        <p className="text-[11px] text-zinc-500">{cmd.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {cmd.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Persona Switchers */}
          {query.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Personas
              </div>
              <div className="space-y-1 mt-1">
                {HAILE_PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectPersona(p.id);
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-zinc-900 text-left flex items-center gap-3 group transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-xs font-medium text-zinc-200">{p.name}</p>
                      <p className="text-[11px] text-zinc-500">{p.tagline}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Conversations */}
          {filteredSessions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Conversations
              </div>
              <div className="space-y-1 mt-1">
                {filteredSessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onSelectSession(s.id);
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-zinc-900 text-left flex items-center justify-between group transition-colors"
                  >
                    <div className="truncate">
                      <p className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100 truncate">
                        {s.title}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {s.messages.length} messages • {s.persona}
                      </p>
                    </div>
                    <span className="text-[11px] text-zinc-600 font-mono">Jump ↵</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/40 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Tip: Press ↑ ↓ to navigate, ↵ to select</span>
          <span className="font-mono">Haile AI Studio 3.0</span>
        </div>
      </div>
    </div>
  );
};
