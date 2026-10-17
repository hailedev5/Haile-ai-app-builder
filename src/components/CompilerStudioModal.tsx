import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Copy,
  Check,
  Download,
  Terminal,
  Code,
  FileCode,
  Search,
  Cpu,
  Layers,
  ChevronDown,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageDefinition } from '../data/languages';
import { executeCodeUniversal, CompileResult } from '../utils/offlineCompiler';

interface CompilerStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLanguage?: string;
  initialCode?: string;
  onAskHaile?: (code: string, language: string) => void;
}

export const CompilerStudioModal: React.FC<CompilerStudioModalProps> = ({
  isOpen,
  onClose,
  initialLanguage = 'python',
  initialCode,
  onAskHaile,
}) => {
  const [selectedLangId, setSelectedLangId] = useState<string>(initialLanguage);
  const [code, setCode] = useState<string>('');
  const [stdin, setStdin] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'output' | 'stdin' | 'error'>('output');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<CompileResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Find active language
  const activeLanguage: LanguageDefinition =
    SUPPORTED_LANGUAGES.find((l) => l.id === selectedLangId) || SUPPORTED_LANGUAGES[0];

  // Sync initial language or code
  useEffect(() => {
    if (initialLanguage) {
      const match = SUPPORTED_LANGUAGES.find(
        (l) => l.id.toLowerCase() === initialLanguage.toLowerCase()
      );
      if (match) setSelectedLangId(match.id);
    }
  }, [initialLanguage]);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    } else {
      setCode(activeLanguage.sampleCode);
    }
    setStdin(activeLanguage.sampleStdin || '');
    setResult(null);
  }, [selectedLangId, initialCode]);

  // Click outside to close language dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const categories = [
    'All',
    'Systems',
    'Scripting',
    'Web & Frontend',
    'Functional',
    'Data & Query',
    'Esoteric & Classical',
  ];

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const matchesCategory = selectedCategory === 'All' || lang.category === selectedCategory;
    const matchesSearch =
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab('output');
    try {
      const res = await executeCodeUniversal(activeLanguage.id, code, stdin);
      setResult(res);
      if (res.stderr && !res.stdout) {
        setActiveTab('error');
      }
    } catch (err: any) {
      setResult({
        stdout: '',
        stderr: err?.message || 'Execution error',
        exitCode: 1,
        executionTimeMs: 0,
        engine: 'in-browser-vm',
        compiled: false,
      });
      setActiveTab('error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetToTemplate = () => {
    setCode(activeLanguage.sampleCode);
    setStdin(activeLanguage.sampleStdin || '');
    setResult(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `main.${activeLanguage.extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-6xl h-[92vh] flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-zinc-100 font-display flex items-center gap-2">
                  Haile Polyglot Compiler Studio
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  50+ Languages Offline
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Native compiler toolchain & in-browser sandboxed runtime execution.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleRunCode}
              disabled={isRunning}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all ${
                isRunning
                  ? 'bg-zinc-800 text-zinc-400 cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 hover:brightness-110 shadow-amber-500/20'
              }`}
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Compiling...' : 'Run Code (Ctrl+Enter)'}</span>
            </button>

            {onAskHaile && (
              <button
                type="button"
                onClick={() => onAskHaile(code, activeLanguage.name)}
                title="Ask Haile AI to review, explain, or optimize this code"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Ask Haile</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetToTemplate}
              title="Reset to language template"
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleCopy}
              title="Copy code"
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleDownloadFile}
              title={`Download .${activeLanguage.extension} file`}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Language Selection Bar */}
        <div className="px-4 py-2 bg-zinc-900/40 border-b border-zinc-800 flex items-center justify-between gap-3 text-xs shrink-0 flex-wrap">
          {/* Language Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-750 hover:border-amber-500/40 text-zinc-200 font-medium transition-colors"
            >
              <FileCode className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">{activeLanguage.name}</span>
              <span className="text-[10px] font-mono text-zinc-400">({activeLanguage.version})</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>

            {isLanguageDropdownOpen && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-2 z-50 max-h-96 flex flex-col">
                {/* Search */}
                <div className="relative p-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 50+ languages..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto py-1.5 px-1 no-scrollbar text-[11px]">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-0.5 rounded-md shrink-0 transition-colors ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* List of Languages */}
                <div className="flex-1 overflow-y-auto space-y-1 p-1 max-h-64">
                  {filteredLanguages.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        setSelectedLangId(l.id);
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                        selectedLangId === l.id
                          ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
                          : 'hover:bg-zinc-900 text-zinc-300'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-xs text-zinc-200">{l.name}</p>
                        <p className="text-[10px] text-zinc-500 truncate max-w-xs">{l.category}</p>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                        .{l.extension}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language description */}
          <div className="hidden lg:flex items-center gap-2 text-zinc-400 text-[11px] truncate max-w-md">
            <span>Category: <strong className="text-zinc-300">{activeLanguage.category}</strong></span>
            <span>•</span>
            <span className="truncate">{activeLanguage.description}</span>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
            <span>{lineCount} lines</span>
            <span>•</span>
            <span className="text-emerald-400">Local Offline Ready</span>
          </div>
        </div>

        {/* Editor & Output Split View */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 min-h-0">
          {/* Left: Code Editor */}
          <div className="flex flex-col h-full min-h-0 bg-zinc-950">
            <div className="px-3 py-1.5 bg-zinc-900/60 border-b border-zinc-800 text-xs text-zinc-400 flex items-center justify-between font-mono">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Code className="w-3.5 h-3.5" />
                <span>Source Editor ({activeLanguage.name})</span>
              </span>
              <span className="text-[10px] text-zinc-500">Auto-saved</span>
            </div>

            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleRunCode();
                }
              }}
              spellCheck={false}
              className="flex-1 w-full p-4 font-mono text-xs md:text-sm bg-transparent text-zinc-100 resize-none focus:outline-none selection:bg-amber-500/30 overflow-auto leading-relaxed"
              placeholder={`Write ${activeLanguage.name} code here...`}
            />
          </div>

          {/* Right: Output / Stdin / Execution Console */}
          <div className="flex flex-col h-full min-h-0 bg-zinc-950">
            {/* Tabs toolbar */}
            <div className="px-3 py-1.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('output')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                    activeTab === 'output'
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Output (stdout)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('stdin')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                    activeTab === 'stdin'
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>Standard Input (stdin)</span>
                  {stdin && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </button>

                {result?.stderr && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('error')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                      activeTab === 'error'
                        ? 'bg-red-500/20 text-red-300 font-semibold'
                        : 'text-red-400 hover:text-red-300'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Errors</span>
                  </button>
                )}
              </div>

              {/* Status indicator */}
              {result && (
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      result.exitCode === 0
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    Exit: {result.exitCode}
                  </span>
                  <span className="text-zinc-400">{result.executionTimeMs}ms</span>
                </div>
              )}
            </div>

            {/* Console Content */}
            <div className="flex-1 relative min-h-0 bg-zinc-950 font-mono text-xs overflow-auto p-4">
              {activeTab === 'output' ? (
                <div>
                  {!result && !isRunning && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-12 space-y-2">
                      <Terminal className="w-8 h-8 text-zinc-700 mx-auto" />
                      <p>Output console will appear here.</p>
                      <p className="text-[11px] text-zinc-600">Click "Run Code" or press Ctrl+Enter to compile & execute.</p>
                    </div>
                  )}

                  {isRunning && (
                    <div className="flex items-center gap-2 text-amber-400 animate-pulse py-4">
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Compiling and running {activeLanguage.name} program...</span>
                    </div>
                  )}

                  {result && (
                    <div className="space-y-2">
                      <div className="text-zinc-200 whitespace-pre-wrap leading-relaxed">
                        {result.stdout || (
                          <span className="text-zinc-500 italic">[Process completed with no standard output]</span>
                        )}
                      </div>

                      {result.stderr && (
                        <div className="pt-3 border-t border-zinc-800 text-red-400 whitespace-pre-wrap">
                          {result.stderr}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : activeTab === 'stdin' ? (
                <div className="h-full flex flex-col space-y-2">
                  <p className="text-[11px] text-zinc-400">
                    Provide inputs passed to standard input (e.g. read by input(), cin, scanf, sys.stdin).
                  </p>
                  <textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder="Type standard input data here..."
                    className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-200 focus:outline-none focus:border-amber-500/50 resize-none font-mono"
                  />
                </div>
              ) : (
                <div className="text-red-400 whitespace-pre-wrap leading-relaxed">
                  {result?.stderr || 'No errors reported.'}
                </div>
              )}
            </div>

            {/* Console Footer */}
            <div className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Compiler: {activeLanguage.name} ({activeLanguage.version})</span>
              </span>
              <span className="font-mono">Press Ctrl+Enter to execute</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
