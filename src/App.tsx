import React, { useState, useEffect, useRef } from 'react';
import {
  ChatSession,
  ChatMessage as ChatMessageType,
  PersonaId,
  AppSettings,
  GeminiModelId,
  Artifact,
  Persona,
  AttachedAudio,
  AttachedFile,
  GroundingSource,
} from './types';
import { HAILE_PERSONAS } from './data/personas';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeHero } from './components/WelcomeHero';
import { PersonaModal } from './components/PersonaModal';
import { SettingsModal } from './components/SettingsModal';
import { CanvasStudio } from './components/CanvasStudio';
import { TemplateModal } from './components/TemplateModal';
import { CommandPalette } from './components/CommandPalette';
import { CodeRunnerModal } from './components/CodeRunnerModal';
import { ImageGenModal } from './components/ImageGenModal';
import { CustomPersonaModal } from './components/CustomPersonaModal';
import { ConversationStatsModal } from './components/ConversationStatsModal';
import { ImportBackupModal } from './components/ImportBackupModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { speechManager, soundFX } from './utils/speech';

const STORAGE_KEY_SESSIONS = 'haile_ai_sessions_v2';
const STORAGE_KEY_SETTINGS = 'haile_ai_settings_v2';

const DEFAULT_SETTINGS: AppSettings = {
  temperature: 0.6,
  customDirectives: '',
  autoSpeak: false,
  voiceSpeed: 1.0,
  soundEffects: true,
  streamResponses: true,
  defaultModel: 'gemini-3.8-flash',
  webSearchDefault: false,
  deepThinkingDefault: false,
  customPersonas: [],
};

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch {}
    return null;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [currentPersona, setCurrentPersona] = useState<PersonaId>('genius');
  const [currentModel, setCurrentModel] = useState<GeminiModelId>(settings.defaultModel || 'gemini-3.8-flash');
  const [searchGrounding, setSearchGrounding] = useState<boolean>(settings.webSearchDefault || false);
  const [deepThinking, setDeepThinking] = useState<boolean>(settings.deepThinkingDefault || false);

  // Canvas / Artifacts Studio State
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);

  // Code Runner Modal State
  const [codeRunnerOpen, setCodeRunnerOpen] = useState(false);
  const [codeRunnerSnippet, setCodeRunnerSnippet] = useState<{ code: string; language: string }>({
    code: '',
    language: 'html',
  });

  // UI Modals State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [imageGenModalOpen, setImageGenModalOpen] = useState(false);
  const [customPersonaModalOpen, setCustomPersonaModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [importBackupModalOpen, setImportBackupModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions:', e);
    }
  }, [sessions]);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }, [settings]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      // Cmd/Ctrl + /: Shortcuts Cheat Sheet
      else if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
      }
      // Cmd/Ctrl + Shift + N: New Session
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewSession();
      }
      // Cmd/Ctrl + Shift + S: Toggle Sidebar
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
      // Cmd/Ctrl + Shift + C: Toggle Canvas Studio
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsCanvasOpen((prev) => !prev);
      }
      // Cmd/Ctrl + Shift + T: Templates Library
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setTemplateModalOpen((prev) => !prev);
      }
      // Escape: Close active modals
      else if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setPersonaModalOpen(false);
        setSettingsOpen(false);
        setTemplateModalOpen(false);
        setImageGenModalOpen(false);
        setCustomPersonaModalOpen(false);
        setStatsModalOpen(false);
        setImportBackupModalOpen(false);
        setShortcutsModalOpen(false);
        setCodeRunnerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId) || null;

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages.length, isStreaming]);

  // Sync current persona with session if session has one
  useEffect(() => {
    if (currentSession && currentSession.persona) {
      setCurrentPersona(currentSession.persona);
    }
  }, [currentSessionId]);

  // Create a new session
  const handleNewSession = (personaOverride?: PersonaId) => {
    const selectedPersona = personaOverride || currentPersona;
    const newSession: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      persona: selectedPersona,
      messages: [],
      tags: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setCurrentPersona(selectedPersona);
    setSuggestions([]);
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (currentSessionId === id) {
        setCurrentSessionId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  // Pin session toggle
  const handleTogglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  };

  // Rename session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  // Tag session
  const handleUpdateTags = (id: string, tags: string[]) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, tags, updatedAt: Date.now() } : s))
    );
  };

  // Clear current session messages
  const handleClearChat = () => {
    if (!currentSessionId) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === currentSessionId ? { ...s, messages: [], updatedAt: Date.now() } : s))
    );
    setSuggestions([]);
  };

  // Reset all data
  const handleResetAllData = () => {
    speechManager.stop();
    setSessions([]);
    setCurrentSessionId(null);
    setSuggestions([]);
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
  };

  // Stop active streaming
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    if (currentSessionId) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== currentSessionId) return s;
          const updatedMessages = s.messages.map((m) =>
            m.isStreaming ? { ...m, isStreaming: false } : m
          );
          return { ...s, messages: updatedMessages };
        })
      );
    }
  };

  // Star a message
  const handleStarToggle = (messageId: string) => {
    if (!currentSessionId) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== currentSessionId) return s;
        const updatedMessages = s.messages.map((m) =>
          m.id === messageId ? { ...m, starred: !m.starred } : m
        );
        return { ...s, messages: updatedMessages };
      })
    );
  };

  // Send message to Haile AI
  const handleSendMessage = async (
    content: string,
    options?: {
      image?: { data: string; mimeType: string; previewUrl: string };
      audio?: AttachedAudio;
      documents?: AttachedFile[];
    }
  ) => {
    const { image, audio, documents } = options || {};
    if (!content.trim() && !image && !audio && (!documents || documents.length === 0)) return;

    if (settings.soundEffects) {
      soundFX.playSend();
    }

    let activeSessionId = currentSessionId;
    let targetSession = currentSession;

    // Create session if none exists
    if (!targetSession || !activeSessionId) {
      const newSession: ChatSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: content.substring(0, 30) || 'Multimodal Workspace',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        persona: currentPersona,
        messages: [],
        tags: [],
      };
      activeSessionId = newSession.id;
      targetSession = newSession;
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
    }

    const userMessage: ChatMessageType = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      image,
      audio,
      documents,
    };

    const assistantMessageId = `msg_assistant_${Date.now()}`;
    const initialAssistantMessage: ChatMessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      personaUsed: currentPersona,
      modelUsed: currentModel,
      isStreaming: true,
      alternatives: [],
    };

    const updatedSessionMessages = [...targetSession.messages, userMessage, initialAssistantMessage];

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          updatedAt: Date.now(),
          messages: updatedSessionMessages,
        };
      })
    );

    setIsStreaming(true);
    setSuggestions([]);

    // Trigger auto-title if first message
    if (targetSession.messages.length === 0 && content) {
      fetch('/api/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.title) {
            handleRenameSession(activeSessionId!, data.title);
          }
        })
        .catch(() => {});
    }

    // Build payload for API
    const historyPayload = [...targetSession.messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
      image: m.image ? { data: m.image.data, mimeType: m.image.mimeType } : undefined,
      audio: m.audio ? { data: m.audio.data, mimeType: m.audio.mimeType } : undefined,
      documents: m.documents,
    }));

    // Find custom persona instructions if any
    const customP = (settings.customPersonas || []).find((p) => p.id === currentPersona);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedContent = '';
    let collectedSources: GroundingSource[] = [];

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: historyPayload,
          persona: currentPersona,
          customPersonaPrompt: customP?.systemPrompt,
          customNotes: settings.customDirectives,
          temperature: customP?.temperature ?? settings.temperature,
          model: currentModel,
          searchGrounding,
          deepThinking,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (reader) {
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const jsonStr = trimmed.substring(6);
              try {
                const data = JSON.parse(jsonStr);
                if (data.error) {
                  accumulatedContent += `\n\n*[Error: ${data.error}]*`;
                } else if (data.text) {
                  accumulatedContent += data.text;
                } else if (data.sources && Array.isArray(data.sources)) {
                  collectedSources = data.sources;
                }

                // Update assistant message state
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id !== activeSessionId) return s;
                    const msgs = s.messages.map((m) =>
                      m.id === assistantMessageId
                        ? {
                            ...m,
                            content: accumulatedContent,
                            sources: collectedSources.length > 0 ? collectedSources : m.sources,
                          }
                        : m
                    );
                    return { ...s, messages: msgs };
                  })
                );
              } catch {}
            }
          }
        }
      }

      // Mark finished
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          const msgs = s.messages.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  isStreaming: false,
                  alternatives: [accumulatedContent],
                  currentAltIndex: 0,
                }
              : m
          );
          return { ...s, messages: msgs };
        })
      );

      if (settings.soundEffects) {
        soundFX.playReceive();
      }

      if (settings.autoSpeak && accumulatedContent) {
        speechManager.speak(accumulatedContent, settings.voiceSpeed);
      }

      // Fetch follow-up suggestions
      fetch('/api/suggest-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastUserMessage: content,
          lastAiMessage: accumulatedContent,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
            setSuggestions(data.suggestions);
          }
        })
        .catch(() => {});
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream stopped by user.');
      } else {
        console.error('Error generating response:', err);
        const errorNote = accumulatedContent
          ? `${accumulatedContent}\n\n*[Response interrupted]*`
          : "I apologize, but I encountered an issue while generating the response. Please check your network and try again.";

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSessionId) return s;
            const msgs = s.messages.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: errorNote, isStreaming: false }
                : m
            );
            return { ...s, messages: msgs };
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate Assistant Message
  const handleRegenerate = async (messageId: string) => {
    if (!currentSession || isStreaming) return;
    const msgIdx = currentSession.messages.findIndex((m) => m.id === messageId);
    if (msgIdx === -1) return;

    // Get conversation history up to previous user message
    const priorHistory = currentSession.messages.slice(0, msgIdx);
    const lastUserMsg = [...priorHistory].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    const currentMsg = currentSession.messages[msgIdx];
    const prevAlternatives = currentMsg.alternatives || [currentMsg.content];

    // Set streaming state
    setIsStreaming(true);
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== currentSession.id) return s;
        const msgs = s.messages.map((m) =>
          m.id === messageId ? { ...m, content: '', isStreaming: true } : m
        );
        return { ...s, messages: msgs };
      })
    );

    const historyPayload = priorHistory.map((m) => ({
      role: m.role,
      content: m.content,
      image: m.image ? { data: m.image.data, mimeType: m.image.mimeType } : undefined,
      audio: m.audio ? { data: m.audio.data, mimeType: m.audio.mimeType } : undefined,
      documents: m.documents,
    }));

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          persona: currentPersona,
          customNotes: settings.customDirectives,
          temperature: settings.temperature + 0.1, // slightly higher variance
          model: currentModel,
          searchGrounding,
          deepThinking,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let newAccumulated = '';

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const data = JSON.parse(trimmed.substring(6));
                if (data.text) {
                  newAccumulated += data.text;
                  setSessions((prev) =>
                    prev.map((s) => {
                      if (s.id !== currentSession.id) return s;
                      const msgs = s.messages.map((m) =>
                        m.id === messageId ? { ...m, content: newAccumulated } : m
                      );
                      return { ...s, messages: msgs };
                    })
                  );
                }
              } catch {}
            }
          }
        }
      }

      const updatedAlternatives = [...prevAlternatives, newAccumulated];
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== currentSession.id) return s;
          const msgs = s.messages.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  isStreaming: false,
                  content: newAccumulated,
                  alternatives: updatedAlternatives,
                  currentAltIndex: updatedAlternatives.length - 1,
                }
              : m
          );
          return { ...s, messages: msgs };
        })
      );
    } catch (err) {
      console.error('Regeneration error:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  // Switch between alternatives
  const handleSwitchAlternative = (messageId: string, direction: 'prev' | 'next') => {
    if (!currentSession) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== currentSession.id) return s;
        const msgs = s.messages.map((m) => {
          if (m.id !== messageId || !m.alternatives) return m;
          const currentIndex = m.currentAltIndex ?? 0;
          let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
          if (newIndex < 0) newIndex = m.alternatives.length - 1;
          if (newIndex >= m.alternatives.length) newIndex = 0;
          return {
            ...m,
            currentAltIndex: newIndex,
            content: m.alternatives[newIndex],
          };
        });
        return { ...s, messages: msgs };
      })
    );
  };

  // Edit user message and branch
  const handleEditUserMessage = (messageId: string, newContent: string) => {
    if (!currentSession) return;
    const msgIndex = currentSession.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // Truncate messages after this message and resend with edited text
    const truncated = currentSession.messages.slice(0, msgIndex);
    setSessions((prev) =>
      prev.map((s) => (s.id === currentSession.id ? { ...s, messages: truncated } : s))
    );

    handleSendMessage(newContent);
  };

  // Rewrite / Translate message action
  const handleRewriteMessage = async (messageId: string, mode: string, targetLanguage?: string) => {
    if (!currentSession) return;
    const targetMsg = currentSession.messages.find((m) => m.id === messageId);
    if (!targetMsg || !targetMsg.content) return;

    try {
      const response = await fetch('/api/rewrite-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: targetMsg.content,
          mode,
          targetLanguage,
        }),
      });

      const data = await response.json();
      if (data.rewrittenText) {
        const titleSuffix =
          mode === 'translate'
            ? `\n\n---\n**🌐 Translated (${targetLanguage || 'Amharic'}):**\n\n`
            : `\n\n---\n**✨ Rewritten (${mode}):**\n\n`;

        const updatedContent = `${targetMsg.content}${titleSuffix}${data.rewrittenText}`;
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== currentSession.id) return s;
            const msgs = s.messages.map((m) =>
              m.id === messageId ? { ...m, content: updatedContent } : m
            );
            return { ...s, messages: msgs };
          })
        );
      }
    } catch (err) {
      console.error('Error rewriting message:', err);
    }
  };

  // Open snippet in Live Code Runner
  const handleOpenRunner = (code: string, language: string) => {
    setCodeRunnerSnippet({ code, language });
    setCodeRunnerOpen(true);
  };

  // Open snippet in Canvas Studio
  const handleOpenInCanvas = (title: string, content: string, language: string) => {
    setActiveArtifact({
      id: `artifact_${Date.now()}`,
      title,
      content,
      language,
      type: language.includes('html') || language.includes('svg') ? 'html' : 'code',
      createdAt: Date.now(),
    });
    setIsCanvasOpen(true);
  };

  // Send AI generated image directly to chat
  const handleSendGeneratedImageToChat = (imageUrl: string, prompt: string) => {
    if (!currentSessionId) {
      handleNewSession();
    }

    const aiImageMsg: ChatMessageType = {
      id: `msg_gen_${Date.now()}`,
      role: 'assistant',
      content: `Here is the visual creation generated for: *"${prompt}"*`,
      timestamp: Date.now(),
      generatedImage: {
        url: imageUrl,
        prompt,
      },
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== currentSessionId) return s;
        return {
          ...s,
          messages: [...s.messages, aiImageMsg],
          updatedAt: Date.now(),
        };
      })
    );
  };

  // Custom persona creation
  const handleSaveCustomPersona = (newPersona: Persona) => {
    const updatedCustoms = [...(settings.customPersonas || []), newPersona];
    setSettings((prev) => ({ ...prev, customPersonas: updatedCustoms }));
    setCurrentPersona(newPersona.id);
  };

  const handleDeleteCustomPersona = (id: string) => {
    const updated = (settings.customPersonas || []).filter((p) => p.id !== id);
    setSettings((prev) => ({ ...prev, customPersonas: updated }));
    if (currentPersona === id) {
      setCurrentPersona('genius');
    }
  };

  // Import / restore backup
  const handleImportBackup = (importedSessions: ChatSession[], importedPersonas?: Persona[]) => {
    setSessions((prev) => [...importedSessions, ...prev]);
    if (importedSessions.length > 0) {
      setCurrentSessionId(importedSessions[0].id);
    }
    if (importedPersonas && importedPersonas.length > 0) {
      setSettings((prev) => ({
        ...prev,
        customPersonas: [...(prev.customPersonas || []), ...importedPersonas],
      }));
    }
  };

  // Export conversation formats (Markdown, JSON, HTML)
  const handleExportChat = (format: 'markdown' | 'json' | 'html') => {
    if (!currentSession || currentSession.messages.length === 0) return;

    let blob: Blob;
    let filename = `Haile_AI_${currentSession.title.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    if (format === 'markdown') {
      let md = `# ${currentSession.title}\n\n`;
      md += `*Persona Mode:* ${currentSession.persona}\n`;
      md += `*Generated by Haile AI on:* ${new Date().toLocaleString()}\n\n---\n\n`;

      currentSession.messages.forEach((m) => {
        const sender = m.role === 'user' ? '### 👤 You' : `### ✦ Haile AI (${m.personaUsed || 'Genius'})`;
        md += `${sender} - *${new Date(m.timestamp).toLocaleTimeString()}*\n\n`;
        if (m.image) md += `*[Attached Image: ${m.image.mimeType}]*\n\n`;
        if (m.audio) md += `*[Attached Audio: ${m.audio.fileName}]*\n\n`;
        md += `${m.content}\n\n---\n\n`;
      });

      blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      filename += '.md';
    } else if (format === 'html') {
      let html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${currentSession.title} - Haile AI</title>`;
      html += `<style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;background:#09090b;color:#f4f4f5;line-height:1.6;}h1{color:#f59e0b;border-bottom:1px solid #27272a;padding-bottom:12px;}.msg{background:#18181b;border:1px solid #27272a;border-radius:12px;padding:16px;margin-bottom:16px;}.user{background:#27272a;}.role{font-weight:bold;font-size:12px;text-transform:uppercase;color:#a1a1aa;margin-bottom:6px;}</style></head><body>`;
      html += `<h1>${currentSession.title}</h1><p style="color:#71717a">Persona: ${currentSession.persona} • Generated by Haile AI Studio</p>`;

      currentSession.messages.forEach((m) => {
        const roleClass = m.role === 'user' ? 'user' : '';
        const roleTitle = m.role === 'user' ? 'You' : `Haile AI (${m.personaUsed || 'Genius'})`;
        html += `<div class="msg ${roleClass}"><div class="role">${roleTitle}</div><div class="content">${m.content.replace(/\n/g, '<br/>')}</div></div>`;
      });
      html += `</body></html>`;

      blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      filename += '.html';
    } else {
      const dataStr = JSON.stringify(currentSession, null, 2);
      blob = new Blob([dataStr], { type: 'application/json' });
      filename += '.json';
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => {
          setCurrentSessionId(id);
          setSidebarOpen(false);
        }}
        onNewSession={() => handleNewSession()}
        onDeleteSession={handleDeleteSession}
        onTogglePinSession={handleTogglePinSession}
        onRenameSession={handleRenameSession}
        onUpdateTags={handleUpdateTags}
        onOpenPersonaModal={() => setPersonaModalOpen(true)}
        onOpenCustomPersonaModal={() => setCustomPersonaModalOpen(true)}
        onOpenImportModal={() => setImportBackupModalOpen(true)}
        onOpenShortcutsModal={() => setShortcutsModalOpen(true)}
      />

      {/* Main chat workspace */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative bg-radial from-zinc-900/30 via-zinc-950 to-zinc-950">
        {/* Top Chat Header */}
        <ChatHeader
          currentSession={currentSession}
          currentPersona={currentPersona}
          onSelectPersona={(p) => {
            setCurrentPersona(p);
            if (currentSessionId) {
              setSessions((prev) =>
                prev.map((s) => (s.id === currentSessionId ? { ...s, persona: p } : s))
              );
            }
          }}
          onNewChat={() => handleNewSession()}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenPersonaModal={() => setPersonaModalOpen(true)}
          onExportChat={handleExportChat}
          onClearChat={handleClearChat}
          autoSpeak={settings.autoSpeak}
          onToggleAutoSpeak={() =>
            setSettings((prev) => ({ ...prev, autoSpeak: !prev.autoSpeak }))
          }
          currentModel={currentModel}
          onToggleCanvas={() => setIsCanvasOpen(!isCanvasOpen)}
          isCanvasOpen={isCanvasOpen}
          onOpenTemplates={() => setTemplateModalOpen(true)}
          onOpenStats={() => setStatsModalOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Scrollable messages container */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-2">
          {!currentSession || currentSession.messages.length === 0 ? (
            <WelcomeHero
              currentPersona={currentPersona}
              onSelectPersona={(p) => setCurrentPersona(p)}
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
            />
          ) : (
            <div className="max-w-4xl mx-auto">
              {currentSession.messages.map((message, idx) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLatestAssistantMessage={
                    message.role === 'assistant' && idx === currentSession.messages.length - 1
                  }
                  onStarToggle={handleStarToggle}
                  onOpenRunner={handleOpenRunner}
                  onOpenInCanvas={handleOpenInCanvas}
                  onRegenerate={handleRegenerate}
                  onEditUserMessage={handleEditUserMessage}
                  onSwitchAlternative={handleSwitchAlternative}
                  onRewriteMessage={handleRewriteMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Sticky Chat Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
          isStreaming={isStreaming}
          suggestions={suggestions}
          onSelectSuggestion={(prompt) => handleSendMessage(prompt)}
          currentPersona={currentPersona}
          currentModel={currentModel}
          onSelectModel={(m) => setCurrentModel(m)}
          searchGrounding={searchGrounding}
          onToggleSearchGrounding={() => setSearchGrounding(!searchGrounding)}
          deepThinking={deepThinking}
          onToggleDeepThinking={() => setDeepThinking(!deepThinking)}
          onOpenTemplates={() => setTemplateModalOpen(true)}
          onOpenImageGen={() => setImageGenModalOpen(true)}
        />
      </main>

      {/* Artifacts / Canvas Studio Workspace Side Panel */}
      <CanvasStudio
        isOpen={isCanvasOpen}
        onClose={() => setIsCanvasOpen(false)}
        artifact={activeArtifact}
        onUpdateArtifact={(updated) => setActiveArtifact(updated)}
        onOpenRunner={handleOpenRunner}
      />

      {/* Interactive Code Runner Modal */}
      <CodeRunnerModal
        isOpen={codeRunnerOpen}
        onClose={() => setCodeRunnerOpen(false)}
        initialCode={codeRunnerSnippet.code}
        language={codeRunnerSnippet.language}
      />

      {/* AI Image Generation Studio Modal */}
      <ImageGenModal
        isOpen={imageGenModalOpen}
        onClose={() => setImageGenModalOpen(false)}
        onSendGeneratedImageToChat={handleSendGeneratedImageToChat}
      />

      {/* Prompt Templates Explorer Modal */}
      <TemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectPrompt={(prompt, autoSend) => {
          if (autoSend) {
            handleSendMessage(prompt);
          } else {
            // Can be picked directly or executed
            handleSendMessage(prompt);
          }
        }}
      />

      {/* Universal Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        sessions={sessions}
        onSelectSession={(id) => {
          setCurrentSessionId(id);
          setCommandPaletteOpen(false);
        }}
        onNewSession={() => handleNewSession()}
        onSelectPersona={(p) => setCurrentPersona(p)}
        onSelectModel={(m) => setCurrentModel(m)}
        currentModel={currentModel}
        onToggleSearchGrounding={() => setSearchGrounding(!searchGrounding)}
        searchGrounding={searchGrounding}
        onToggleDeepThinking={() => setDeepThinking(!deepThinking)}
        deepThinking={deepThinking}
        onOpenTemplates={() => setTemplateModalOpen(true)}
        onOpenCanvas={() => setIsCanvasOpen(true)}
        onOpenImageGen={() => setImageGenModalOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
      />

      {/* Custom Persona Architect Modal */}
      <CustomPersonaModal
        isOpen={customPersonaModalOpen}
        onClose={() => setCustomPersonaModalOpen(false)}
        onSaveCustomPersona={handleSaveCustomPersona}
      />

      {/* Conversation Analytics Stats Modal */}
      <ConversationStatsModal
        isOpen={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        session={currentSession}
      />

      {/* Import & Restore Backup Modal */}
      <ImportBackupModal
        isOpen={importBackupModalOpen}
        onClose={() => setImportBackupModalOpen(false)}
        onImportSuccess={handleImportBackup}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      {/* Persona Exploration Modal */}
      <PersonaModal
        isOpen={personaModalOpen}
        onClose={() => setPersonaModalOpen(false)}
        currentPersona={currentPersona}
        onSelectPersona={(p) => {
          setCurrentPersona(p);
          if (currentSessionId) {
            setSessions((prev) =>
              prev.map((s) => (s.id === currentSessionId ? { ...s, persona: p } : s))
            );
          }
        }}
        onSelectPrompt={(prompt, persona) => {
          setCurrentPersona(persona);
          handleSendMessage(prompt);
        }}
        customPersonas={settings.customPersonas}
      />

      {/* Settings Configuration Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        onResetAllData={handleResetAllData}
        onDeleteCustomPersona={handleDeleteCustomPersona}
      />
    </div>
  );
}
