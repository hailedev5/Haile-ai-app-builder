import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  X,
  Sparkles,
  Check,
  Compass,
} from 'lucide-react';
import { ChatSession, PersonaId } from '../types';
import { HaileLogo } from './HaileLogo';
import { HAILE_PERSONAS } from '../data/personas';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePinSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onOpenPersonaModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onTogglePinSession,
  onRenameSession,
  onOpenPersonaModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.pinned);
  const recentSessions = filteredSessions.filter((s) => !s.pinned);

  const startRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const renderSessionItem = (s: ChatSession) => {
    const isSelected = s.id === currentSessionId;
    const isEditing = editingId === s.id;
    const persona = HAILE_PERSONAS.find((p) => p.id === s.persona) || HAILE_PERSONAS[0];

    return (
      <div
        key={s.id}
        onClick={() => onSelectSession(s.id)}
        className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all border ${
          isSelected
            ? 'bg-zinc-850 border-amber-500/30 text-zinc-100 shadow-sm'
            : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <MessageSquare
            className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`}
          />

          {isEditing ? (
            <form
              onSubmit={(e) => saveRename(s.id, e)}
              className="flex-1 flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => saveRename(s.id)}
                className="w-full bg-zinc-950 border border-amber-500/50 rounded px-1.5 py-0.5 text-xs text-zinc-100 focus:outline-none"
              />
              <button
                type="submit"
                className="p-1 text-emerald-400 hover:text-emerald-300"
              >
                <Check className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="truncate leading-tight">{s.title}</p>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                <span>{persona.name.replace('Haile ', '')}</span>
                <span>•</span>
                <span>{new Date(s.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action icons on hover */}
        {!isEditing && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pl-1 shrink-0">
            <button
              id={`pin-session-${s.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinSession(s.id);
              }}
              title={s.pinned ? 'Unpin chat' : 'Pin chat'}
              className={`p-1 rounded hover:bg-zinc-800 ${
                s.pinned ? 'text-amber-400 opacity-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Pin className={`w-3 h-3 ${s.pinned ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              id={`rename-session-${s.id}`}
              type="button"
              onClick={(e) => startRename(s, e)}
              title="Rename session"
              className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            >
              <Edit2 className="w-3 h-3" />
            </button>

            <button
              id={`delete-session-${s.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(s.id);
              }}
              title="Delete session"
              className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-zinc-950 border-r border-zinc-850 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HaileLogo size="sm" />
            <div>
              <h2 className="font-bold text-sm text-zinc-100 tracking-tight font-display">
                Haile AI
              </h2>
              <p className="text-[11px] text-zinc-400">Cognitive Companion</p>
            </div>
          </div>

          <button
            id="close-sidebar-mobile-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action: New Chat */}
        <div className="p-3">
          <button
            id="sidebar-new-chat-btn"
            type="button"
            onClick={() => {
              onNewSession();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-semibold text-xs hover:brightness-110 shadow-md shadow-amber-500/10 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Cognitive Chat</span>
          </button>
        </div>

        {/* Search Filter */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Session Lists Scroll Area */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 py-1">
          {/* Pinned Sessions */}
          {pinnedSessions.length > 0 && (
            <div>
              <div className="px-2 py-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                <Pin className="w-3 h-3" />
                <span>Pinned ({pinnedSessions.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {pinnedSessions.map(renderSessionItem)}
              </div>
            </div>
          )}

          {/* Recent Sessions */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <span>{pinnedSessions.length > 0 ? 'Recent' : 'All Conversations'} ({recentSessions.length})</span>
            </div>
            <div className="space-y-1 mt-1">
              {recentSessions.length > 0 ? (
                recentSessions.map(renderSessionItem)
              ) : (
                <div className="p-4 text-center text-xs text-zinc-400">
                  {searchQuery ? 'No matching conversations' : 'No previous conversations'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Footer & Mode Explorer */}
        <div className="p-3 border-t border-zinc-850 bg-zinc-950/90 space-y-2">
          <button
            id="sidebar-persona-modal-btn"
            type="button"
            onClick={onOpenPersonaModal}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-300 hover:text-amber-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Haile Personas & Modes</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">5 modes</span>
          </button>

          <div className="px-2 py-1 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Gemini 3.8 Flash
            </span>
            <span className="text-zinc-400">Online</span>
          </div>
        </div>
      </aside>
    </>
  );
};
