import React, { useState } from 'react';
import { X, Search, Sparkles, Send, ArrowRight, BookOpen, Layers, Code, CheckCircle, Bug, TrendingUp, Shield, DollarSign, Sigma, FlaskConical, Globe, Languages, CheckSquare, Clock } from 'lucide-react';
import { PROMPT_TEMPLATES } from '../data/templates';
import { PromptTemplate } from '../types';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string, autoSend?: boolean) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Coding & Architecture', 'Writing & Content', 'Business & Strategy', 'Science & Math', 'Languages & Culture', 'Productivity'];

  const filteredTemplates = PROMPT_TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                Haile Prompt & Workflow Library
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-normal">
                  {PROMPT_TEMPLATES.length} templates
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Curated high-leverage cognitive workflows designed for deep problem solving.
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

        {/* Filter bar */}
        <div className="p-4 border-b border-zinc-800 space-y-3 bg-zinc-900/30">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search prompts, categories, tags..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-zinc-950 font-semibold shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="group p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-900/90 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 font-mono">
                    {tpl.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {tpl.tags.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-amber-300 transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{tpl.description}</p>
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-[11px] text-zinc-300 font-mono line-clamp-3">
                  {tpl.prompt}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 mt-2 border-t border-zinc-800/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectPrompt(tpl.prompt, false);
                    onClose();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium transition-colors"
                >
                  Insert to Input
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPrompt(tpl.prompt, true);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 text-xs font-semibold hover:brightness-110 shadow-sm transition-all"
                >
                  <span>Execute Now</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-500 text-sm">
              No prompt templates match your search query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
