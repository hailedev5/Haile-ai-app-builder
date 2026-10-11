import React, { useState } from 'react';
import { X, Sparkles, Image as ImageIcon, Download, Send, RefreshCw, Wand2 } from 'lucide-react';

interface ImageGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendGeneratedImageToChat: (imageUrl: string, prompt: string) => void;
}

export const ImageGenModal: React.FC<ImageGenModalProps> = ({
  isOpen,
  onClose,
  onSendGeneratedImageToChat,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{ url: string; prompt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const stylePresets = [
    { name: 'Afro-Futurism', suffix: 'in visionary Ethiopian Afro-futuristic aesthetic, golden solar patterns, luminous details, hyper-detailed 8k' },
    { name: 'Cyberpunk Neon', suffix: 'cinematic cyberpunk style, vivid neon glow, volumetric atmospheric lighting, Unreal Engine 5' },
    { name: 'Minimalist Vector', suffix: 'clean minimalist vector art, bold lines, modern geometric elegance, vibrant flat colors' },
    { name: 'Architectural Blueprint', suffix: 'detailed isometric architectural blueprint, engineering schematic, precise technical line art' },
    { name: 'Photorealistic', suffix: 'ultra-realistic photography, 8k resolution, cinematic lighting, 50mm f/1.8 depth of field' },
  ];

  const handleApplyPreset = (suffix: string) => {
    setPrompt((prev) => (prev ? `${prev}, ${suffix}` : suffix));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate image.');
      }

      setGeneratedResult({ url: data.imageUrl, prompt: data.prompt });
    } catch (err: any) {
      setError(err.message || 'Image generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedResult) return;
    const link = document.createElement('a');
    link.href = generatedResult.url;
    link.download = `haile_art_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                Haile AI Image Generation Studio
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  Multimodal
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Transform creative visions into high-definition digital art and schematics.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Image Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want Haile AI to envision (e.g. A luminous solar tower in ancient Lalibela, architectural future realism...)"
              rows={3}
              className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed"
            />
          </div>

          {/* Style Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Artistic Style Modifiers
            </span>
            <div className="flex flex-wrap gap-1.5">
              {stylePresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset.suffix)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-purple-300 hover:border-purple-500/40 transition-colors"
                >
                  + {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio picker */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Aspect Ratio
            </span>
            <div className="flex items-center gap-2">
              {(['1:1', '16:9', '4:3', '9:16'] as const).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    aspectRatio === ratio
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedResult && (
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="relative group rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={generatedResult.url}
                  alt={generatedResult.prompt}
                  className="max-h-80 w-auto object-contain rounded-xl shadow-lg"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <p className="text-zinc-400 text-[11px] truncate max-w-md">
                  Prompt: <span className="text-zinc-200">{generatedResult.prompt}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSendGeneratedImageToChat(generatedResult.url, generatedResult.prompt);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Chat</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <span className="text-xs text-zinc-500">Multimodal Gemini & Imagen Engine</span>
          <button
            type="button"
            disabled={!prompt.trim() || isGenerating}
            onClick={handleGenerate}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              prompt.trim() && !isGenerating
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:brightness-110 shadow-lg shadow-purple-500/20'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Envisioning...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Artwork</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
