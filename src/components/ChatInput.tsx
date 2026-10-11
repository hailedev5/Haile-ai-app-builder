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
} from 'lucide-react';
import { PersonaId } from '../types';
import { HAILE_PERSONAS } from '../data/personas';

interface ChatInputProps {
  onSendMessage: (content: string, image?: { data: string; mimeType: string; previewUrl: string }) => void;
  onStopGeneration: () => void;
  isStreaming: boolean;
  suggestions?: string[];
  onSelectSuggestion?: (s: string) => void;
  currentPersona: PersonaId;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  suggestions = [],
  onSelectSuggestion,
  currentPersona,
}) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{
    data: string;
    mimeType: string;
    previewUrl: string;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPEG, WebP).');
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
    // Reset file input value so same file can be selected again
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
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
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isStreaming) {
      onStopGeneration();
      return;
    }

    const trimmed = input.trim();
    if (!trimmed && !selectedImage) return;

    onSendMessage(trimmed, selectedImage || undefined);
    setInput('');
    setSelectedImage(null);

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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-1">
      {/* Suggestions pill row */}
      {suggestions.length > 0 && !isStreaming && onSelectSuggestion && (
        <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
          <div className="flex items-center gap-1 text-zinc-500 shrink-0 mr-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Sparks:</span>
          </div>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              id={`suggest-btn-${idx}`}
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
        {/* Attached image thumbnail preview */}
        {selectedImage && (
          <div className="p-3 pb-0 flex items-center gap-2">
            <div className="relative group inline-block">
              <img
                src={selectedImage.previewUrl}
                alt="Selected preview"
                className="w-16 h-16 object-cover rounded-lg border border-zinc-700 bg-zinc-950"
              />
              <button
                id="remove-attached-image-btn"
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-500 shadow"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="text-xs text-zinc-400">
              <p className="font-medium text-zinc-300">Image attached</p>
              <p className="text-[11px] text-zinc-500">Haile will analyze this multimodal input</p>
            </div>
          </div>
        )}

        {/* Textarea */}
        <div className="px-3.5 pt-3 pb-2">
          <textarea
            id="haile-chat-textarea"
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={`Message ${persona.name}...`}
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-sm md:text-[15px] resize-none focus:outline-none leading-relaxed max-h-48"
          />
        </div>

        {/* Action toolbar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-zinc-800/60">
          <div className="flex items-center gap-1">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImageSelect}
            />

            <button
              id="upload-image-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach image for Haile AI vision"
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {speechSupported && (
              <button
                id="voice-mic-btn"
                type="button"
                onClick={handleToggleSpeech}
                title={isRecording ? 'Stop speech recognition' : 'Speak to Haile'}
                className={`p-2 rounded-xl transition-colors ${
                  isRecording
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <span className="text-[11px] text-zinc-500 ml-1 hidden sm:inline-block font-mono">
              Mode: <span className="text-zinc-400">{persona.name.replace('Haile ', '')}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-600 hidden md:inline">
              Return ↵ to send
            </span>

            {isStreaming ? (
              <button
                id="stop-streaming-btn"
                type="button"
                onClick={onStopGeneration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 text-xs font-medium transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-red-300" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                id="send-message-btn"
                type="button"
                disabled={!input.trim() && !selectedImage}
                onClick={() => handleSubmit()}
                className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                  input.trim() || selectedImage
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
