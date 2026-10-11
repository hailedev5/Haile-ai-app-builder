import { Persona } from '../types';

export const HAILE_PERSONAS: Persona[] = [
  {
    id: 'genius',
    name: 'Haile Genius',
    tagline: 'Deep Reasoning & Architecture',
    description: 'Specialized in rigorous STEM problem solving, algorithms, full-stack architecture, logic deconstruction, and debugging.',
    icon: 'Cpu',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    accentGradient: 'from-amber-500 to-orange-600',
    temperature: 0.4,
    samplePrompts: [
      'Explain how distributed consensus works in Raft vs Paxos',
      'Optimize this TypeScript async pipeline for memory efficiency',
      'Derive the mathematical intuition behind attention in transformers',
      'Architect a real-time event streaming pipeline for 1M concurrent users'
    ],
  },
  {
    id: 'speed',
    name: 'Haile Speed',
    tagline: 'Rapid Execution & Direct Answers',
    description: 'High-velocity, zero-fluff answers designed for busy builders who need crisp answers, bullet points, and immediate action.',
    icon: 'Zap',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    accentGradient: 'from-emerald-400 to-teal-600',
    temperature: 0.3,
    samplePrompts: [
      'Give me 5 punchy bullet points on the pros and cons of SQLite vs Postgres',
      'Write a bash command to find and kill processes locking port 3000',
      'Summarize key principles of atomic design in 4 lines',
      'Convert this JSON payload into a strict TypeScript interface'
    ],
  },
  {
    id: 'creative',
    name: 'Haile Creative',
    tagline: 'Visionary Muse & Storyteller',
    description: 'Rich narrative craftsmanship, evocative metaphors, brand storytelling, poetic depth, and lateral creative brainstorming.',
    icon: 'Sparkles',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    accentGradient: 'from-purple-400 to-pink-600',
    temperature: 0.9,
    samplePrompts: [
      'Write a poetic reflection on humanity launching solar sails into the deep void',
      'Brainstorm 5 brand names and tagline narratives for an acoustic studio',
      'Craft an evocative monologue from the perspective of an ancient mountain',
      'Write a sci-fi micro-story set in a floating solar observatory'
    ],
  },
  {
    id: 'sage',
    name: 'Haile Sage',
    tagline: 'Wisdom, Culture & Perspective',
    description: 'Reflective life insights, cross-cultural heritage, philosophical nuance, and timeless proverbs bridging ancient roots with modern life.',
    icon: 'Compass',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    accentGradient: 'from-blue-400 to-cyan-600',
    temperature: 0.6,
    samplePrompts: [
      'Share an Ethiopian proverb about patience and explain its modern relevance',
      'How can one balance high ambition with inner peace and gratitude?',
      'What did Stoicism and Eastern philosophies discover about managing uncertainty?',
      'Reflect on the evolution of human tools from stone axes to neural networks'
    ],
  },
  {
    id: 'executive',
    name: 'Haile Executive',
    tagline: 'Strategy, Leadership & Venture',
    description: 'Strategic advisory, product positioning, risk assessment, pitch crafting, and high-impact executive summaries.',
    icon: 'ShieldCheck',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    accentGradient: 'from-rose-400 to-red-600',
    temperature: 0.5,
    samplePrompts: [
      'Review this SaaS go-to-market strategy and point out fatal distribution risks',
      'Draft a crisp 1-page executive summary for a seed fundraising pitch',
      'How should we structure pricing tiers for developer API adoption?',
      'Frame a difficult team restructuring message with empathy and authority'
    ],
  },
];
