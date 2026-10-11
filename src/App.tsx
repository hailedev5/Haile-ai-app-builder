import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, ChatMessage as ChatMessageType, PersonaId, AppSettings } from './types';
import { HAILE_PERSONAS } from './data/personas';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeHero } from './components/WelcomeHero';
import { PersonaModal } from './components/PersonaModal';
import { SettingsModal } from './components/SettingsModal';
import { speechManager, soundFX } from './utils/speech';

const STORAGE_KEY_SESSIONS = 'haile_ai_sessions_v1';
const STORAGE_KEY_SETTINGS = 'haile_ai_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  temperature: 0.6,
  customDirectives: '',
  autoSpeak: false,
  voiceSpeed: 1.0,
  soundEffects: true,
  streamResponses: true,
};

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [currentPersona, setCurrentPersona] = useState<PersonaId>('genius');
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions to localStorage:', e);
    }
  }, [sessions]);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e);
    }
  }, [settings]);

  // Scroll to bottom on new messages
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

    // Mark current streaming assistant message as finished
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
    image?: { data: string; mimeType: string; previewUrl: string }
  ) => {
    if (!content.trim() && !image) return;

    if (settings.soundEffects) {
      soundFX.playSend();
    }

    let activeSessionId = currentSessionId;
    let targetSession = currentSession;

    // Create session if none exists
    if (!targetSession || !activeSessionId) {
      const newSession: ChatSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: content.substring(0, 30) || 'Image Analysis',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        persona: currentPersona,
        messages: [],
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
    };

    const assistantMessageId = `msg_assistant_${Date.now()}`;
    const initialAssistantMessage: ChatMessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      personaUsed: currentPersona,
      isStreaming: true,
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

    // Trigger auto-title if it's the first user message
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

    // Format conversation history for API
    const historyPayload = [...targetSession.messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
      image: m.image ? { data: m.image.data, mimeType: m.image.mimeType } : undefined,
    }));

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedContent = '';

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: historyPayload,
          persona: currentPersona,
          customNotes: settings.customDirectives,
          temperature: settings.temperature,
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
                }

                // Update assistant message with current chunk
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id !== activeSessionId) return s;
                    const msgs = s.messages.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: accumulatedContent }
                        : m
                    );
                    return { ...s, messages: msgs };
                  })
                );
              } catch {
                // partial chunk, ignore
              }
            }
          }
        }
      }

      // Mark streaming completed
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          const msgs = s.messages.map((m) =>
            m.id === assistantMessageId ? { ...m, isStreaming: false } : m
          );
          return { ...s, messages: msgs };
        })
      );

      if (settings.soundEffects) {
        soundFX.playReceive();
      }

      // Voice read aloud if enabled
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
        console.log('Generation aborted by user.');
      } else {
        console.error('Error generating Haile AI response:', err);
        const errorNote = accumulatedContent
          ? `${accumulatedContent}\n\n*[Response interrupted or failed]*`
          : "I apologize, but I encountered an issue while generating the response. Please verify that your connection is stable and try asking again.";

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

  // Export conversation
  const handleExportChat = (format: 'markdown' | 'json') => {
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
        if (m.image) {
          md += `*[Attached Image: ${m.image.mimeType}]*\n\n`;
        }
        md += `${m.content}\n\n---\n\n`;
      });

      blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      filename += '.md';
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
        onOpenPersonaModal={() => setPersonaModalOpen(true)}
      />

      {/* Main chat view */}
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
        />
      </main>

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
      />

      {/* Settings Configuration Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        onResetAllData={handleResetAllData}
      />
    </div>
  );
}
