import React, { useState } from 'react';
import {
  Menu,
  Plus,
  Settings,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronDown,
  Trash2,
  Share2,
  FileCode,
  BookOpen,
  BarChart3,
  Search,
  Zap,
} from 'lucide-react';
import { PersonaId, ChatSession, GeminiModelId } from '../types';
import { HAILE_PERSONAS } from '../data/personas';
import { HaileLogo } from './HaileLogo';

interface ChatHeaderProps {
  currentSession: ChatSession | null;
  currentPersona: PersonaId;
  onSelectPersona: (persona: PersonaId) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenPersonaModal: () => void;
  onExportChat: (format: 'markdown' | 'json' | 'html') => void;
  onClearChat: () => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  currentModel: GeminiModelId;
  onToggleCanvas: () => void;
  isCanvasOpen: boolean;
  onOpenTemplates: () => void;
  onOpenStats: () => void;
  onOpenCommandPalette: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentSession,
  currentPersona,
  onSelectPersona,
  onNewChat,
  onToggleSidebar,
  onOpenSettings,
  onOpenPersonaModal,
  onExportChat,
  onClearChat,
  autoSpeak,
  onToggleAutoSpeak,
  currentModel,
  onToggleCanvas,
  isCanvasOpen,
  onOpenTemplates,
  onOpenStats,
  onOpenCommandPalette,
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const persona = HAILE_PERSONAS.find((p) => p.id === currentPersona) || {
    id: currentPersona,
    name: currentPersona,
    tagline: 'Custom Intelligence',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  };

  return (
    <header className="h-15 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between sticky top-0 z-30">
      {/* Left section: Sidebar toggle & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          title="Toggle history sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="cursor-pointer" onClick={onOpenPersonaModal}>
            <HaileLogo size="sm" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-100 font-display tracking-tight">
                Haile AI
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                v3.0
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate max-w-[120px] sm:max-w-xs md:max-w-sm">
              {currentSession ? currentSession.title : 'New Cognitive Session'}
            </p>
          </div>
        </div>
      </div>

      {/* Right section: Actions & Modals */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Command Palette trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Command Palette (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px] font-mono">Cmd+K</span>
        </button>

        {/* Templates library button */}
        <button
          type="button"
          onClick={onOpenTemplates}
          className="p-2 rounded-xl text-zinc-400 hover:text-amber-300 hover:bg-zinc-900 transition-colors hidden sm:inline-flex"
          title="Prompt Templates Library"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Canvas Studio Toggle */}
        <button
          type="button"
          onClick={onToggleCanvas}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
            isCanvasOpen
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:bg-zinc-850'
          }`}
          title="Canvas Studio & Artifacts Panel"
        >
          <FileCode className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Canvas</span>
        </button>

        {/* Persona quick switch dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${persona.badgeColor}`}
            title="Switch Haile AI persona"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{persona.name}</span>
            <span className="md:hidden">{persona.name.replace('Haile ', '')}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 mb-1 flex items-center justify-between">
                <span>Select Haile Mode</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowPersonaMenu(false);
                    onOpenPersonaModal();
                  }}
                  className="text-amber-400 hover:underline capitalize text-[11px]"
                >
                  view details
                </button>
              </div>

              {HAILE_PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelectPersona(p.id);
                    setShowPersonaMenu(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl transition-all flex items-start gap-2.5 ${
                    p.id === currentPersona
                      ? 'bg-zinc-800 text-zinc-100 border border-amber-500/30'
                      : 'hover:bg-zinc-800/60 text-zinc-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${p.badgeColor}`}
                  >
                    {p.name.charAt(6)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-tight text-zinc-200">{p.name}</p>
                    <p className="text-[11px] text-zinc-400 leading-snug truncate">
                      {p.tagline}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auto-read aloud voice toggle */}
        <button
          type="button"
          onClick={onToggleAutoSpeak}
          title={autoSpeak ? 'Auto voice playback enabled' : 'Auto voice playback disabled'}
          className={`p-2 rounded-xl text-xs transition-colors ${
            autoSpeak
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Conversation Analytics Stats button */}
        {currentSession && currentSession.messages.length > 0 && (
          <button
            type="button"
            onClick={onOpenStats}
            title="Conversation Stats & Token Metrics"
            className="p-2 rounded-xl text-zinc-400 hover:text-amber-300 hover:bg-zinc-900 transition-colors hidden sm:inline-flex"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        )}

        {/* Export dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Export conversation"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl p-1.5 z-50">
              <button
                type="button"
                onClick={() => {
                  onExportChat('markdown');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs rounded-lg text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                Markdown (.md)
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportChat('html');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs rounded-lg text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                Print / HTML Document
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportChat('json');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs rounded-lg text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                JSON Data Backup (.json)
              </button>
            </div>
          )}
        </div>

        {/* Clear chat if messages exist */}
        {currentSession && currentSession.messages.length > 0 && (
          <button
            type="button"
            onClick={onClearChat}
            title="Clear current chat"
            className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition-colors hidden sm:inline-flex"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Haile AI Settings"
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* New Chat button */}
        <button
          type="button"
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-semibold text-xs hover:brightness-110 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
};
