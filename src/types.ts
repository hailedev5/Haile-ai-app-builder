export type PersonaId = 'genius' | 'speed' | 'creative' | 'sage' | 'executive' | string;

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
  isCustom?: boolean;
  systemPrompt?: string;
}

export type GeminiModelId = 'gemini-3.8-flash' | 'gemini-2.5-flash' | 'gemini-2.5-pro';

export interface GroundingSource {
  title: string;
  url: string;
  domain?: string;
}

export interface AttachedFile {
  name: string;
  content: string;
  size: number;
  type: string;
}

export interface AttachedAudio {
  data: string; // base64
  mimeType: string;
  fileName: string;
  duration?: number;
}

export interface Artifact {
  id: string;
  title: string;
  language: string;
  content: string;
  type: 'code' | 'markdown' | 'html' | 'svg';
  createdAt: number;
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
  audio?: AttachedAudio;
  documents?: AttachedFile[];
  generatedImage?: {
    url: string;
    prompt: string;
  };
  personaUsed?: PersonaId;
  modelUsed?: GeminiModelId;
  isStreaming?: boolean;
  starred?: boolean;
  sources?: GroundingSource[];
  thinking?: string;
  isThinkingExpanded?: boolean;
  alternatives?: string[]; // alternative responses for regeneration
  currentAltIndex?: number;
  wordCount?: number;
  tokenCount?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  persona: PersonaId;
  messages: ChatMessage[];
  pinned?: boolean;
  tags?: string[];
}

export interface AppSettings {
  temperature: number;
  customDirectives: string;
  autoSpeak: boolean;
  voiceSpeed: number;
  soundEffects: boolean;
  streamResponses: boolean;
  defaultModel: GeminiModelId;
  webSearchDefault: boolean;
  deepThinkingDefault: boolean;
  customPersonas?: Persona[];
}

export interface PromptTemplate {
  id: string;
  category: 'Coding & Architecture' | 'Writing & Content' | 'Business & Strategy' | 'Science & Math' | 'Languages & Culture' | 'Productivity';
  title: string;
  description: string;
  prompt: string;
  icon: string;
  tags: string[];
}
