import React, { useState, useEffect } from 'react';
import { X, Play, RefreshCw, Terminal, Eye, Code, Copy, Check } from 'lucide-react';

interface CodeRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode: string;
  language?: string;
}

export const CodeRunnerModal: React.FC<CodeRunnerModalProps> = ({
  isOpen,
  onClose,
  initialCode,
  language = 'html',
}) => {
  const [code, setCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<'preview' | 'console'>('preview');
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setCode(initialCode);
    setLogs([]);
  }, [initialCode]);

  if (!isOpen) return null;

  const isHtmlLike =
    language.includes('html') ||
    language.includes('svg') ||
    code.includes('<!DOCTYPE') ||
    code.includes('<html') ||
    code.includes('<div') ||
    code.includes('<svg');

  const runCode = () => {
    setLogs([]);
    setKey((prev) => prev + 1);

    if (!isHtmlLike) {
      // Execute JS in a safe evaluation container and capture console logs
      try {
        const capturedLogs: string[] = [];
        const originalLog = console.log;
        console.log = (...args: any[]) => {
          capturedLogs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
        };

        const execute = new Function(code);
        const result = execute();
        if (result !== undefined) {
          capturedLogs.push(`Return: ${JSON.stringify(result, null, 2)}`);
        }
        console.log = originalLog;
        setLogs(capturedLogs);
        setActiveTab('console');
      } catch (err: any) {
        setLogs([`Error: ${err.message}`]);
        setActiveTab('console');
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewSrcDoc = isHtmlLike
    ? code
    : `
<!DOCTYPE html>
<html>
<head>
  <style>body { font-family: sans-serif; background: #09090b; color: #f4f4f5; padding: 20px; }</style>
</head>
<body>
  <h3>JavaScript Execution Output</h3>
  <pre id="output"></pre>
  <script>
    const output = document.getElementById('output');
    console.log = (...args) => {
      output.innerText += args.join(' ') + '\\n';
    };
    try {
      ${code}
    } catch(e) {
      output.innerText += 'Error: ' + e.message;
    }
  </script>
</body>
</html>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-5xl h-[85vh] flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Play className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                Haile Interactive Sandbox & Code Runner
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                  {language}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={runCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 text-xs font-semibold hover:brightness-110 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Run / Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Split view: Code editor & Live Runner */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 min-h-0">
          {/* Left: Code Editor */}
          <div className="flex flex-col h-full min-h-0 bg-zinc-950">
            <div className="px-3 py-1.5 bg-zinc-900/60 border-b border-zinc-800 text-xs text-zinc-400 flex items-center justify-between font-mono">
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-amber-400" />
                Source Code
              </span>
              <span>{code.split('\n').length} lines</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full p-4 font-mono text-xs md:text-sm bg-transparent text-zinc-200 resize-none focus:outline-none selection:bg-amber-500/30 overflow-auto leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Right: Output / Live Sandbox */}
          <div className="flex flex-col h-full min-h-0 bg-zinc-950">
            {/* Tabs */}
            <div className="px-3 py-1.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-amber-500/20 text-amber-300 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('console')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                    activeTab === 'console'
                      ? 'bg-amber-500/20 text-amber-300 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Console Logs</span>
                  {logs.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 text-[10px] flex items-center justify-center font-bold">
                      {logs.length}
                    </span>
                  )}
                </button>
              </div>

              <span className="text-[11px] text-zinc-500 font-mono">Sandbox Sandbox</span>
            </div>

            {/* Content */}
            <div className="flex-1 relative min-h-0 bg-zinc-950">
              {activeTab === 'preview' ? (
                <iframe
                  key={key}
                  srcDoc={previewSrcDoc}
                  title="Haile Code Sandbox"
                  sandbox="allow-scripts allow-modals allow-same-origin"
                  className="w-full h-full border-0 bg-white dark:bg-zinc-900"
                />
              ) : (
                <div className="p-4 font-mono text-xs text-zinc-300 overflow-auto h-full space-y-1">
                  {logs.length === 0 ? (
                    <p className="text-zinc-500 italic">No output yet. Click 'Run / Refresh' to execute.</p>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className="py-0.5 border-b border-zinc-800/40 text-emerald-400">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
