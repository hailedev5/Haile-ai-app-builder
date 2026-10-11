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
  Brain,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Play,
  FileCode,
  RotateCcw,
  Edit3,
  Languages,
  Wand2,
  FileText,
  Music,
  Download,
} from 'lucide-react';
import { ChatMessage as ChatMessageType, PersonaId, GroundingSource } from '../types';
import { HAILE_PERSONAS } from '../data/personas';
import { HaileLogo } from './HaileLogo';
import { speechManager } from '../utils/speech';
import { MermaidViewer } from './MermaidViewer';

interface ChatMessageProps {
  message: ChatMessageType;
  isLatestAssistantMessage?: boolean;
  onStarToggle?: (id: string) => void;
  onOpenRunner?: (code: string, language: string) => void;
  onOpenInCanvas?: (title: string, content: string, language: string) => void;
  onRegenerate?: (messageId: string) => void;
  onEditUserMessage?: (messageId: string, newContent: string) => void;
  onSwitchAlternative?: (messageId: string, direction: 'prev' | 'next') => void;
  onRewriteMessage?: (messageId: string, mode: string, targetLanguage?: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLatestAssistantMessage,
  onStarToggle,
  onOpenRunner,
  onOpenInCanvas,
  onRegenerate,
  onEditUserMessage,
  onSwitchAlternative,
  onRewriteMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editInput, setEditInput] = useState(message.content);
  const [showRewriteMenu, setShowRewriteMenu] = useState(false);

  const isAssistant = message.role === 'assistant';
  const persona = isAssistant
    ? HAILE_PERSONAS.find((p) => p.id === message.personaUsed) || HAILE_PERSONAS[0]
    : null;

  // Extract <thinking> tags if present in assistant response
  let thinkingContent: string | null = null;
  let displayContent = message.content;

  if (isAssistant && message.content.includes('<thinking>')) {
    const parts = message.content.split('</thinking>');
    if (parts.length > 1) {
      thinkingContent = parts[0].replace('<thinking>', '').trim();
      displayContent = parts.slice(1).join('</thinking>').trim();
    } else {
      // Still streaming inside thinking tag
      const startSplit = message.content.split('<thinking>');
      if (startSplit.length > 1) {
        thinkingContent = startSplit[1].trim();
        displayContent = '';
      }
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      speechManager.stop();
      setIsSpeaking(false);
    } else {
      const started = speechManager.speak(displayContent, 1.0, () => {
        setIsSpeaking(false);
      });
      if (started) {
        setIsSpeaking(true);
      }
    }
  };

  const handleSaveEdit = () => {
    if (onEditUserMessage && editInput.trim() !== message.content) {
      onEditUserMessage(message.id, editInput.trim());
    }
    setIsEditing(false);
  };

  const wordCount = (displayContent || '').trim().split(/\s+/).filter(Boolean).length;
  const tokenEstimate = Math.round((displayContent || '').length / 4);

  return (
    <div
      className={`group w-full py-5 px-4 md:px-6 transition-all rounded-2xl mb-3.5 ${
        isAssistant
          ? 'bg-zinc-900/60 border border-zinc-800/80 shadow-md shadow-black/20'
          : 'bg-zinc-900/30 hover:bg-zinc-900/40 border border-transparent hover:border-zinc-800/50'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-start gap-3.5 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isAssistant ? (
            <HaileLogo size="sm" isThinking={message.isStreaming} />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-zinc-600/50 flex items-center justify-center text-zinc-200 shadow-sm">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Body */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Header Row */}
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

              {isAssistant && message.modelUsed && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  {message.modelUsed.replace('gemini-', '')}
                </span>
              )}

              {message.isStreaming && (
                <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 animate-pulse font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Reasoning...
                </span>
              )}
            </div>

            {/* Quick Actions Toolbar */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              {/* Alternatives switcher if available */}
              {isAssistant && message.alternatives && message.alternatives.length > 1 && onSwitchAlternative && (
                <div className="flex items-center gap-1 mr-1 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-300">
                  <button
                    type="button"
                    onClick={() => onSwitchAlternative(message.id, 'prev')}
                    className="hover:text-amber-400 px-1"
                  >
                    ‹
                  </button>
                  <span>
                    {(message.currentAltIndex ?? 0) + 1}/{message.alternatives.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSwitchAlternative(message.id, 'next')}
                    className="hover:text-amber-400 px-1"
                  >
                    ›
                  </button>
                </div>
              )}

              {/* Edit User Message Button */}
              {!isAssistant && onEditUserMessage && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  title="Edit message & branch"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Assistant voice read aloud */}
              {isAssistant && displayContent && (
                <button
                  type="button"
                  onClick={handleSpeakToggle}
                  title={isSpeaking ? 'Stop speaking' : 'Read aloud with voice'}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    isSpeaking
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Copy */}
              {displayContent && (
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy to clipboard"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Star toggle */}
              {onStarToggle && (
                <button
                  type="button"
                  onClick={() => onStarToggle(message.id)}
                  title={message.starred ? 'Unstar message' : 'Star message'}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    message.starred
                      ? 'text-amber-400 hover:bg-amber-400/10'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${message.starred ? 'fill-amber-400' : ''}`} />
                </button>
              )}

              {/* Regenerate Alternative for assistant */}
              {isAssistant && onRegenerate && !message.isStreaming && (
                <button
                  type="button"
                  onClick={() => onRegenerate(message.id)}
                  title="Regenerate alternative answer"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 text-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Rewrite / Translate menu toggle */}
              {isAssistant && onRewriteMessage && !message.isStreaming && displayContent && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRewriteMenu(!showRewriteMenu)}
                    title="Translate or rewrite tone"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 text-xs transition-colors"
                  >
                    <Languages className="w-3.5 h-3.5" />
                  </button>

                  {showRewriteMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-40 text-xs">
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 mb-1">
                        Translate Into
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onRewriteMessage(message.id, 'translate', 'Amharic (Ethiopia)');
                          setShowRewriteMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 flex items-center justify-between"
                      >
                        <span>Amharic (አማርኛ)</span>
                        <span className="text-[10px]">🇪🇹</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onRewriteMessage(message.id, 'translate', 'Spanish');
                          setShowRewriteMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 flex items-center justify-between"
                      >
                        <span>Spanish (Español)</span>
                        <span className="text-[10px]">🇪🇸</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onRewriteMessage(message.id, 'translate', 'French');
                          setShowRewriteMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 flex items-center justify-between"
                      >
                        <span>French (Français)</span>
                        <span className="text-[10px]">🇫🇷</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onRewriteMessage(message.id, 'translate', 'Arabic');
                          setShowRewriteMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 flex items-center justify-between"
                      >
                        <span>Arabic (العربية)</span>
                        <span className="text-[10px]">🇸🇦</span>
                      </button>

                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 my-1 pt-1">
                        Rewrite Tone
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onRewriteMessage(message.id, 'executive');
                          setShowRewriteMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300"
                      >
                        Executive Memo Style
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onRewriteMessage(message.id, 'simplify');
                          setShowRewriteMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300"
                      >
                        ELI5 (Simple Explanation)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onRewriteMessage(message.id, 'technical');
                          setShowRewriteMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300"
                      >
                        Technical Precision
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onRewriteMessage(message.id, 'poetic');
                          setShowRewriteMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300"
                      >
                        Lyrical & Poetic
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* User Attached Audio Card */}
          {message.audio && (
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3 max-w-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 shrink-0">
                  <Music className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-200 truncate">{message.audio.fileName}</p>
                  <p className="text-[10px] text-zinc-500">Audio input analyzed by Haile</p>
                </div>
              </div>
              <audio controls src={`data:${message.audio.mimeType};base64,${message.audio.data}`} className="h-8 max-w-[160px]" />
            </div>
          )}

          {/* User Attached Document Badges */}
          {message.documents && message.documents.length > 0 && (
            <div className="flex flex-wrap gap-2 my-1">
              {message.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono text-[11px] truncate max-w-[160px]">{doc.name}</span>
                  <span className="text-[10px] text-zinc-500">({Math.round(doc.size / 1024)} KB)</span>
                </div>
              ))}
            </div>
          )}

          {/* User Uploaded Image Preview */}
          {message.image && message.image.data && (
            <div className="my-2 max-w-sm rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950/50 shadow-md">
              <img
                src={message.image.previewUrl || `data:${message.image.mimeType};base64,${message.image.data}`}
                alt="Attached input"
                className="w-full max-h-64 object-contain bg-zinc-950"
              />
            </div>
          )}

          {/* AI Generated Image Card */}
          {message.generatedImage && (
            <div className="my-2.5 max-w-md rounded-2xl overflow-hidden border border-purple-500/30 bg-zinc-950 shadow-xl space-y-2 p-2">
              <img
                src={message.generatedImage.url}
                alt={message.generatedImage.prompt}
                className="w-full max-h-72 object-contain rounded-xl bg-black"
              />
              <div className="flex items-center justify-between px-2 pb-1 text-xs text-zinc-400">
                <span className="truncate text-[11px] max-w-xs">{message.generatedImage.prompt}</span>
                <a
                  href={message.generatedImage.url}
                  download={`haile_image_${Date.now()}.png`}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span className="text-[10px]">Save</span>
                </a>
              </div>
            </div>
          )}

          {/* Expandable Thinking Process Block */}
          {thinkingContent && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 overflow-hidden my-2">
              <button
                type="button"
                onClick={() => setThinkingExpanded(!thinkingExpanded)}
                className="w-full px-3 py-2 flex items-center justify-between text-xs font-medium text-amber-400/90 hover:bg-amber-500/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-amber-400" />
                  <span>Deep Chain-of-Thought</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    ({thinkingContent.split(/\s+/).length} words)
                  </span>
                </div>
                {thinkingExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {thinkingExpanded && (
                <div className="p-3 pt-1 border-t border-amber-500/20 text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {thinkingContent}
                </div>
              )}
            </div>
          )}

          {/* Inline Edit for User Message */}
          {isEditing ? (
            <div className="space-y-2 mt-1">
              <textarea
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-zinc-950 border border-amber-500/50 text-sm text-zinc-100 focus:outline-none resize-none font-sans leading-relaxed"
              />
              <div className="flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-semibold hover:brightness-110"
                >
                  Save & Resend
                </button>
              </div>
            </div>
          ) : (
            /* Main Rendered Text Content */
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
                        const codeString = String(children).replace(/\n$/, '');
                        const match = /language-(\w+)/.exec(className || '');
                        const lang = match ? match[1] : '';

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

                        // Check if code block is Mermaid diagram
                        if (lang === 'mermaid' || codeString.trim().startsWith('graph ') || codeString.trim().startsWith('flowchart ') || codeString.trim().startsWith('sequenceDiagram')) {
                          return <MermaidViewer chart={codeString} />;
                        }

                        return (
                          <div className="relative group/code my-3 rounded-xl overflow-hidden border border-zinc-700/70 bg-zinc-950">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
                              <span className="text-amber-400/90">{lang || 'code'}</span>
                              <div className="flex items-center gap-2">
                                {onOpenRunner && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenRunner(codeString, lang)}
                                    className="flex items-center gap-1 text-zinc-400 hover:text-amber-300 text-[11px] px-1.5 py-0.5 rounded hover:bg-zinc-800"
                                    title="Run in live sandbox"
                                  >
                                    <Play className="w-3 h-3" />
                                    <span>Run</span>
                                  </button>
                                )}
                                {onOpenInCanvas && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onOpenInCanvas(
                                        `${lang || 'snippet'}_${Date.now()}`,
                                        codeString,
                                        lang
                                      )
                                    }
                                    className="flex items-center gap-1 text-zinc-400 hover:text-cyan-300 text-[11px] px-1.5 py-0.5 rounded hover:bg-zinc-800"
                                    title="Open in Canvas Studio"
                                  >
                                    <FileCode className="w-3 h-3" />
                                    <span>Canvas</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => navigator.clipboard.writeText(codeString)}
                                  className="text-zinc-400 hover:text-zinc-200 text-[11px] px-1.5 py-0.5 rounded hover:bg-zinc-800"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                            <pre className="p-3 text-xs md:text-sm text-zinc-200 overflow-x-auto leading-relaxed">
                              <code {...props}>{children}</code>
                            </pre>
                          </div>
                        );
                      },
                    }}
                  >
                    {displayContent}
                  </Markdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed text-zinc-100">
                  {message.content}
                </p>
              )}
            </div>
          )}

          {/* Web Search Grounding Citations */}
          {message.sources && message.sources.length > 0 && (
            <div className="pt-2 border-t border-zinc-800/60 mt-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Web Sources & References</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 hover:text-blue-300 hover:border-blue-500/40 transition-colors group/link"
                  >
                    <span className="truncate max-w-[200px]">{src.title}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-500 group-hover/link:text-blue-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Feedback & Metrics Footer Bar */}
          {isAssistant && !message.isStreaming && displayContent && (
            <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/40">
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>•</span>
                <span>{wordCount} words</span>
                <span>•</span>
                <span>~{tokenEstimate} tokens</span>
              </div>

              <div className="flex items-center gap-1">
                <button
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
