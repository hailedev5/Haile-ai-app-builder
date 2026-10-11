import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  User,
  Star,
} from 'lucide-react';
import { ChatMessage as ChatMessageType, PersonaId } from '../types';
import { HAILE_PERSONAS } from '../data/personas';
import { HaileLogo } from './HaileLogo';
import { speechManager } from '../utils/speech';

interface ChatMessageProps {
  message: ChatMessageType;
  isLatestAssistantMessage?: boolean;
  onStarToggle?: (id: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLatestAssistantMessage,
  onStarToggle,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const isAssistant = message.role === 'assistant';
  const persona = isAssistant
    ? HAILE_PERSONAS.find((p) => p.id === message.personaUsed) || HAILE_PERSONAS[0]
    : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      speechManager.stop();
      setIsSpeaking(false);
    } else {
      const started = speechManager.speak(message.content, 1.0, () => {
        setIsSpeaking(false);
      });
      if (started) {
        setIsSpeaking(true);
      }
    }
  };

  return (
    <div
      className={`group w-full py-5 px-4 md:px-6 transition-colors rounded-2xl mb-3 ${
        isAssistant
          ? 'bg-zinc-900/60 border border-zinc-800/80 shadow-sm shadow-black/20'
          : 'bg-zinc-900/20 hover:bg-zinc-900/30'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isAssistant ? (
            <HaileLogo size="sm" isThinking={message.isStreaming} />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-300">
              <User className="w-4 h-4 text-zinc-300" />
            </div>
          )}
        </div>

        {/* Message Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-zinc-200">
                {isAssistant ? 'Haile AI' : 'You'}
              </span>

              {isAssistant && persona && (
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${persona.badgeColor}`}
                >
                  {persona.name}
                </span>
              )}

              {message.isStreaming && (
                <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 animate-pulse font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Generating...
                </span>
              )}
            </div>

            {/* Quick Actions (only shown for non-empty content) */}
            {message.content && (
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {isAssistant && (
                  <button
                    id={`speak-btn-${message.id}`}
                    type="button"
                    onClick={handleSpeakToggle}
                    title={isSpeaking ? 'Stop speaking' : 'Read aloud with Haile voice'}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      isSpeaking
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                <button
                  id={`copy-btn-${message.id}`}
                  type="button"
                  onClick={handleCopy}
                  title="Copy to clipboard"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {onStarToggle && (
                  <button
                    id={`star-btn-${message.id}`}
                    type="button"
                    onClick={() => onStarToggle(message.id)}
                    title={message.starred ? 'Unstar message' : 'Star message'}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      message.starred
                        ? 'text-amber-400 hover:bg-amber-400/10'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${message.starred ? 'fill-amber-400' : ''}`}
                    />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Uploaded image if present */}
          {message.image && message.image.data && (
            <div className="my-3 max-w-sm rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950/50 shadow-md">
              <img
                src={message.image.previewUrl || `data:${message.image.mimeType};base64,${message.image.data}`}
                alt="Attached input"
                className="w-full max-h-64 object-contain bg-zinc-950"
              />
            </div>
          )}

          {/* Text Content / Markdown */}
          <div className="text-zinc-200 text-[15px] leading-relaxed break-words">
            {isAssistant ? (
              <div className="markdown-body space-y-3 prose prose-invert max-w-none text-zinc-200">
                <Markdown
                  components={{
                    p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold text-amber-300 mt-4 mb-2 pb-1 border-b border-zinc-800">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-semibold text-zinc-100 mt-3 mb-2">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-semibold text-amber-200/90 mt-2 mb-1">
                        {children}
                      </h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 mb-3 text-zinc-300 pl-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 mb-3 text-zinc-300 pl-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-amber-500/60 pl-3 py-1 my-3 bg-amber-500/5 rounded-r-lg text-zinc-300 italic text-sm">
                        {children}
                      </blockquote>
                    ),
                    code: ({ inline, className, children, ...props }: any) => {
                      if (inline) {
                        return (
                          <code
                            className="bg-zinc-800/90 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono border border-zinc-700/50"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      return (
                        <div className="relative group/code my-3 rounded-xl overflow-hidden border border-zinc-700/70 bg-zinc-950">
                          <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
                            <span>code</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(String(children));
                              }}
                              className="text-zinc-400 hover:text-zinc-200 hover:underline text-[11px]"
                            >
                              Copy
                            </button>
                          </div>
                          <pre className="p-3 text-xs md:text-sm text-zinc-200 overflow-x-auto leading-relaxed">
                            <code {...props}>{children}</code>
                          </pre>
                        </div>
                      );
                    },
                  }}
                >
                  {message.content}
                </Markdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed text-zinc-100">
                {message.content}
              </p>
            )}
          </div>

          {/* Feedback bar for assistant */}
          {isAssistant && !message.isStreaming && message.content && (
            <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/40">
              <span className="text-[11px] font-mono">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>

              <div className="flex items-center gap-1">
                <button
                  id={`like-btn-${message.id}`}
                  type="button"
                  onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
                  className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                    feedback === 'like' ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Helpful response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  id={`dislike-btn-${message.id}`}
                  type="button"
                  onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
                  className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                    feedback === 'dislike' ? 'text-red-400' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Needs improvement"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
