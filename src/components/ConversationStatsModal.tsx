import React from 'react';
import { X, BarChart3, Clock, Hash, MessageSquare, Zap, HardDrive } from 'lucide-react';
import { ChatSession } from '../types';

interface ConversationStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession | null;
}

export const ConversationStatsModal: React.FC<ConversationStatsModalProps> = ({
  isOpen,
  onClose,
  session,
}) => {
  if (!isOpen || !session) return null;

  const userMessages = session.messages.filter((m) => m.role === 'user');
  const aiMessages = session.messages.filter((m) => m.role === 'assistant');

  const totalWords = session.messages.reduce((acc, m) => {
    return acc + (m.content ? m.content.trim().split(/\s+/).filter(Boolean).length : 0);
  }, 0);

  // Approximate tokens ~ 1 token ~= 4 characters or 0.75 words
  const estimatedTokens = Math.round(
    session.messages.reduce((acc, m) => acc + (m.content ? m.content.length / 3.8 : 0), 0)
  );

  const readingTimeMinutes = Math.max(1, Math.round(totalWords / 220));

  const imageCount = session.messages.filter((m) => Boolean(m.image || m.generatedImage)).length;
  const audioCount = session.messages.filter((m) => Boolean(m.audio)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Conversation Metrics & Stats</h2>
              <p className="text-xs text-zinc-400 truncate max-w-xs">{session.title}</p>
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

        {/* Metric Cards Grid */}
        <div className="p-5 grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <Hash className="w-3.5 h-3.5 text-amber-400" />
              <span>Total Words</span>
            </div>
            <p className="text-xl font-bold text-zinc-100 font-mono">{totalWords.toLocaleString()}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Est. Tokens</span>
            </div>
            <p className="text-xl font-bold text-amber-400 font-mono">{estimatedTokens.toLocaleString()}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reading Time</span>
            </div>
            <p className="text-xl font-bold text-zinc-100 font-mono">~{readingTimeMinutes} min</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>Messages</span>
            </div>
            <p className="text-xl font-bold text-zinc-100 font-mono">{session.messages.length}</p>
            <p className="text-[10px] text-zinc-500">
              {userMessages.length} user / {aiMessages.length} Haile
            </p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="px-5 pb-5 space-y-2">
          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Persona Mode Active:</span>
              <span className="text-zinc-200 font-medium capitalize">{session.persona}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Multimodal Visuals:</span>
              <span className="text-zinc-200">{imageCount} assets</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Audio Transcripts:</span>
              <span className="text-zinc-200">{audioCount} clips</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Created On:</span>
              <span className="text-zinc-200">{new Date(session.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
