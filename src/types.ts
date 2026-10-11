export type PersonaId = 'genius' | 'speed' | 'creative' | 'sage' | 'executive';

export interface Persona {
  id: PersonaId;
  name: string;
  tagline: string;
  description: string;
  icon: string; // Lucide icon name
  badgeColor: string;
  accentGradient: string;
  temperature: number;
  samplePrompts: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: {
    data: string; // base64
    mimeType: string;
    previewUrl?: string;
  };
  personaUsed?: PersonaId;
  isStreaming?: boolean;
  starred?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  persona: PersonaId;
  messages: ChatMessage[];
  pinned?: boolean;
}

export interface AppSettings {
  temperature: number;
  customDirectives: string;
  autoSpeak: boolean;
  voiceSpeed: number;
  soundEffects: boolean;
  streamResponses: boolean;
}
