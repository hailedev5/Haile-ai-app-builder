import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw, Download, Maximize2 } from 'lucide-react';

interface MermaidViewerProps {
  chart: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [scale, setScale] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          darkMode: true,
          background: '#09090b',
          primaryColor: '#f59e0b',
          primaryTextColor: '#f3f4f6',
          primaryBorderColor: '#d97706',
          lineColor: '#71717a',
          secondaryColor: '#18181b',
          tertiaryColor: '#27272a',
        },
        securityLevel: 'loose',
        fontFamily: 'inherit',
      });

      const uniqueId = `mermaid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      mermaid
        .render(uniqueId, chart.trim())
        .then((result) => {
          if (isMounted) {
            setSvgContent(result.svg);
            setError(null);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.warn('Mermaid rendering failed:', err);
            setError('Could not render diagram visually.');
          }
        });
    } catch (err: any) {
      if (isMounted) {
        setError('Mermaid parse error');
      }
    }

    return () => {
      isMounted = false;
    };
  }, [chart]);

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `haile_diagram_${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="my-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono">
        <p className="text-amber-400 font-medium mb-1">Diagram definition:</p>
        <pre className="overflow-x-auto text-zinc-300">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="my-3 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-lg shadow-black/30">
      {/* Diagram toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 text-xs text-zinc-400">
        <div className="flex items-center gap-1.5 font-medium text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Interactive Diagram</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(s + 0.2, 2.5))}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setScale(1)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors ml-1"
            title="Download SVG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        ref={containerRef}
        className="p-4 overflow-x-auto flex items-center justify-center min-h-[160px] bg-zinc-950/70"
      >
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.15s ease-out' }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
          className="max-w-full [&>svg]:mx-auto [&>svg]:max-w-full"
        />
      </div>
    </div>
  );
};
