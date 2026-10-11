import React, { useRef, useEffect, useState } from 'react';
import {
  Send,
  Square,
  Image as ImageIcon,
  X,
  Mic,
  MicOff,
  Sparkles,
  Paperclip,
  Globe,
  Brain,
  Wand2,
  BookOpen,
  Music,
  ChevronDown,
  FileText,
  Zap,
  Cpu,
} from 'lucide-react';
import { PersonaId, GeminiModelId, AttachedFile, AttachedAudio } from '../types';
import { HAILE_PERSONAS } from '../data/personas';

interface ChatInputProps {
  onSendMessage: (
    content: string,
    options?: {
      image?: { data: string; mimeType: string; previewUrl: string };
      audio?: AttachedAudio;
      documents?: AttachedFile[];
    }
  ) => void;
  onStopGeneration: () => void;
  isStreaming: boolean;
  suggestions?: string[];
  onSelectSuggestion?: (s: string) => void;
  currentPersona: PersonaId;
  currentModel: GeminiModelId;
  onSelectModel: (m: GeminiModelId) => void;
  searchGrounding: boolean;
  onToggleSearchGrounding: () => void;
  deepThinking: boolean;
  onToggleDeepThinking: () => void;
  onOpenTemplates: () => void;
  onOpenImageGen: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  suggestions = [],
  onSelectSuggestion,
  currentPersona,
  currentModel,
  onSelectModel,
  searchGrounding,
  onToggleSearchGrounding,
  deepThinking,
  onToggleDeepThinking,
  onOpenTemplates,
  onOpenImageGen,
}) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{
    data: string;
    mimeType: string;
    previewUrl: string;
  } | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<AttachedAudio | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const persona = HAILE_PERSONAS.find((p) => p.id === currentPersona) || HAILE_PERSONAS[0];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsRecording(false);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleToggleSpeech = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  // Image attachment
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPEG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setSelectedImage({
        data: base64Data,
        mimeType: file.type,
        previewUrl: result,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Audio attachment (.mp3, .wav, .m4a, .ogg)
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setSelectedAudio({
        data: base64Data,
        mimeType: file.type || 'audio/mp3',
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Document/Code file attachment (.txt, .md, .csv, .json, .py, .ts, etc.)
  const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            content,
            size: file.size,
            type: file.type || file.name.split('.').pop() || 'text',
          },
        ]);
      };
      reader.readAsText(file);
    });

    e.target.value = '';
  };

  // Magic Prompt Enhancer
  const handleEnhancePrompt = async () => {
    if (!input.trim() || isEnhancingPrompt) return;
    setIsEnhancingPrompt(true);

    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input.trim() }),
      });
      const data = await response.json();
      if (data.enhancedPrompt) {
        setInput(data.enhancedPrompt);
      }
    } catch {
      // ignore
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isStreaming) {
      onStopGeneration();
      return;
    }

    const trimmed = input.trim();
    if (!trimmed && !selectedImage && !selectedAudio && attachedFiles.length === 0) return;

    onSendMessage(trimmed, {
      image: selectedImage || undefined,
      audio: selectedAudio || undefined,
      documents: attachedFiles.length > 0 ? attachedFiles : undefined,
    });

    setInput('');
    setSelectedImage(null);
    setSelectedAudio(null);
    setAttachedFiles([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const modelLabels: Record<GeminiModelId, { name: string; tag: string }> = {
    'gemini-3.8-flash': { name: 'Gemini 3.8 Flash', tag: 'Fast • High-IQ' },
    'gemini-2.5-flash': { name: 'Gemini 2.5 Flash', tag: 'Responsive' },
    'gemini-2.5-pro': { name: 'Gemini 2.5 Pro', tag: 'Deep Reasoning' },
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-4 pt-1">
      {/* Suggestions pill row */}
      {suggestions.length > 0 && !isStreaming && onSelectSuggestion && (
        <div className="mb-2 flex items-center gap-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
          <div className="flex items-center gap-1 text-zinc-500 shrink-0 mr-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Sparks:</span>
          </div>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSuggestion(s)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 hover:border-amber-500/40 hover:bg-zinc-850 transition-all truncate max-w-xs"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Main input card */}
      <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all shadow-xl shadow-black/40">
        {/* Attachments preview row */}
        {(selectedImage || selectedAudio || attachedFiles.length > 0) && (
          <div className="p-3 pb-0 flex flex-wrap items-center gap-2">
            {/* Image Preview */}
            {selectedImage && (
              <div className="relative group inline-block">
                <img
                  src={selectedImage.previewUrl}
                  alt="Selected preview"
                  className="w-14 h-14 object-cover rounded-lg border border-zinc-700 bg-zinc-950"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-500 shadow"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Audio Preview */}
            {selectedAudio && (
              <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-300">
                <Music className="w-3.5 h-3.5 text-red-400" />
                <span className="font-mono text-[11px] truncate max-w-[140px]">
                  {selectedAudio.fileName}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAudio(null)}
                  className="p-1 text-zinc-400 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Document Files */}
            {attachedFiles.map((doc, idx) => (
              <div
                key={idx}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-300"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono text-[11px] truncate max-w-[130px]">{doc.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                  className="p-1 text-zinc-400 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <div className="px-3.5 pt-3 pb-1.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${persona.name}... (Press Shift+Enter for new line)`}
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-sm md:text-[15px] resize-none focus:outline-none leading-relaxed max-h-48"
          />
        </div>

        {/* Action toolbar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1.5 border-t border-zinc-800/60 flex-wrap gap-2">
          {/* Left toolbar items */}
          <div className="flex items-center gap-1 flex-wrap">
            {/* Hidden file inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImageSelect}
            />
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleAudioSelect}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.json,.csv,.py,.ts,.js,.jsx,.tsx,.html,.css,.sql"
              multiple
              className="hidden"
              onChange={handleDocFileSelect}
            />

            {/* Model Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelPicker(!showModelPicker)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-xs font-mono text-zinc-300 transition-colors"
                title="Select underlying Gemini model"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">
                  {currentModel === 'gemini-3.8-flash'
                    ? '3.8 Flash'
                    : currentModel === 'gemini-2.5-pro'
                    ? '2.5 Pro'
                    : '2.5 Flash'}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>

              {showModelPicker && (
                <div className="absolute left-0 bottom-full mb-2 w-56 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-1.5 z-50">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 mb-1">
                    Select Gemini Model
                  </div>
                  {(['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'] as GeminiModelId[]).map(
                    (m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          onSelectModel(m);
                          setShowModelPicker(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                          currentModel === m
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            : 'hover:bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-zinc-200">{modelLabels[m].name}</p>
                          <p className="text-[10px] text-zinc-400">{modelLabels[m].tag}</p>
                        </div>
                        {currentModel === m && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Web Search Grounding Toggle */}
            <button
              type="button"
              onClick={onToggleSearchGrounding}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs transition-colors border ${
                searchGrounding
                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-sm'
                  : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
              }`}
              title={searchGrounding ? 'Google Search Grounding: ON' : 'Turn on Google Search Grounding'}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Search</span>
            </button>

            {/* Deep Thinking Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDeepThinking}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs transition-colors border ${
                deepThinking
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
              }`}
              title={deepThinking ? 'Deep Thinking Mode: ON' : 'Turn on Deep Thinking Reasoner'}
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Thinking</span>
            </button>

            {/* Attach Image */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              title="Attach image for vision analysis"
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Attach Audio */}
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              title="Attach audio clip (.mp3, .wav)"
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <Music className="w-4 h-4" />
            </button>

            {/* Attach Documents */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach text / code document (.txt, .md, .csv, .py, .ts)"
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Dictation Mic */}
            {speechSupported && (
              <button
                type="button"
                onClick={handleToggleSpeech}
                title={isRecording ? 'Stop dictation' : 'Voice dictation'}
                className={`p-1.5 rounded-xl transition-colors ${
                  isRecording
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* Templates Quick Trigger */}
            <button
              type="button"
              onClick={onOpenTemplates}
              title="Browse Prompt & Workflow Library"
              className="p-1.5 rounded-xl text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 transition-colors hidden sm:inline-flex"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* AI Image Studio Trigger */}
            <button
              type="button"
              onClick={onOpenImageGen}
              title="Generate AI Artwork"
              className="p-1.5 rounded-xl text-zinc-400 hover:text-purple-300 hover:bg-zinc-800 transition-colors hidden sm:inline-flex"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* Right send & stop buttons */}
          <div className="flex items-center gap-1.5">
            {/* Prompt Enhancer Wand */}
            {input.trim().length > 3 && !isStreaming && (
              <button
                type="button"
                disabled={isEnhancingPrompt}
                onClick={handleEnhancePrompt}
                title="Enhance prompt with AI"
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 text-xs transition-colors"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isEnhancingPrompt ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Enhance</span>
              </button>
            )}

            {isStreaming ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 text-xs font-medium transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-red-300" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!input.trim() && !selectedImage && !selectedAudio && attachedFiles.length === 0}
                onClick={() => handleSubmit()}
                className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                  input.trim() || selectedImage || selectedAudio || attachedFiles.length > 0
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 hover:brightness-110 shadow-md shadow-amber-500/20 cursor-pointer'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
