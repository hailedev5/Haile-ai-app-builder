import { PromptTemplate } from '../types';

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Coding & Architecture
  {
    id: 'arch_distributed',
    category: 'Coding & Architecture',
    title: 'Architect Scalable Distributed System',
    description: 'Design a resilient high-throughput architecture with fault tolerance and caching.',
    prompt: 'Architect a distributed, fault-tolerant backend system for [Insert Use Case, e.g. real-time collaborative document editing]. Provide high-level system diagrams (in Mermaid format), database schema considerations, caching strategies (Redis), and failover mechanisms.',
    icon: 'Layers',
    tags: ['Architecture', 'Distributed', 'Mermaid'],
  },
  {
    id: 'code_refactor_clean',
    category: 'Coding & Architecture',
    title: 'Senior Engineer Code Refactoring',
    description: 'Audit code for complexity, type safety, memory leaks, and clean SOLID principles.',
    prompt: 'Refactor this code to production-grade standards. Address performance bottlenecks, tighten TypeScript typings, improve modularity, and add explanatory comments:\n\n```\n// Paste code here\n```',
    icon: 'Code',
    tags: ['Refactor', 'Clean Code', 'TypeScript'],
  },
  {
    id: 'unit_test_suite',
    category: 'Coding & Architecture',
    title: 'Comprehensive Unit & Edge Case Tests',
    description: 'Generate robust test suites covering happy paths, edge cases, and error boundaries.',
    prompt: 'Write a comprehensive test suite using Vitest/Jest for the following component/function. Include unit tests, boundary/edge cases, and mock asynchronous calls:\n\n```\n// Paste function or component here\n```',
    icon: 'CheckCircle',
    tags: ['Testing', 'QA', 'Vitest'],
  },
  {
    id: 'root_cause_debugging',
    category: 'Coding & Architecture',
    title: 'Root Cause Debugging & Crash Analysis',
    description: 'Deconstruct obscure stack traces, concurrency race conditions, or memory leaks.',
    prompt: 'Analyze this error stack trace and snippet. Diagnose the root cause, explain why it fails under concurrent load, and provide the exact fix:\n\n```\n// Paste error and code\n```',
    icon: 'Bug',
    tags: ['Debugging', 'Memory', 'Errors'],
  },

  // Writing & Content
  {
    id: 'brand_manifesto',
    category: 'Writing & Content',
    title: 'Visionary Brand Manifesto',
    description: 'Craft an inspiring, memorable brand narrative that moves audiences.',
    prompt: 'Draft an evocative, high-energy brand manifesto for [Company or Product Name]. Tone: authentic, bold, and visionary. Structure into: The Core Belief, The Status Quo We Reject, The Future We Are Building, and The Call to Adventure.',
    icon: 'Sparkles',
    tags: ['Branding', 'Copywriting', 'Narrative'],
  },
  {
    id: 'tech_deep_dive_essay',
    category: 'Writing & Content',
    title: 'In-Depth Technical Deep Dive Article',
    description: 'Write a compelling, clear technical article explaining complex engineering concepts.',
    prompt: 'Write a comprehensive, engaging technical deep dive on [Topic, e.g. Internals of Vector Databases & HNSW Indexing]. Include real-world analogies, code snippets, architectural trade-offs, and clear takeaways for senior engineers.',
    icon: 'FileText',
    tags: ['Article', 'Technical Writing', 'Engineering'],
  },
  {
    id: 'executive_keynote',
    category: 'Writing & Content',
    title: 'Executive Keynote Speech',
    description: 'Write a charismatic opening address for a conference or company all-hands.',
    prompt: 'Draft a 5-minute opening keynote speech for [Event or Occasion]. Audience: [e.g. 500 tech founders and engineers]. Theme: [e.g. Navigating AI Transformation with Human Ingenuity]. Tone: Inspiring, grounded, and memorable.',
    icon: 'Mic',
    tags: ['Speech', 'Leadership', 'Keynote'],
  },

  // Business & Strategy
  {
    id: 'seed_pitch_teardown',
    category: 'Business & Strategy',
    title: 'Venture Pitch Deck Teardown',
    description: 'Stress-test your startup pitch for defensibility, unit economics, and TAM.',
    prompt: 'Act as a top-tier venture capitalist. Teardown this startup pitch: [Insert Startup Concept & Target Market]. Identify fatal distribution flaws, defensibility gaps (moats), customer acquisition risks, and suggest 3 high-leverage pivots.',
    icon: 'TrendingUp',
    tags: ['Startups', 'VC', 'Pitch'],
  },
  {
    id: 'competitive_swot_matrix',
    category: 'Business & Strategy',
    title: 'Competitive Moat & SWOT Analysis',
    description: 'Deconstruct industry competitors with actionable strategic recommendations.',
    prompt: 'Conduct a rigorous competitive SWOT and Moat analysis for [Company/Product] against [Key Competitors]. Provide a strategic positioning matrix and identify the 2 most defensible product differentiators.',
    icon: 'Shield',
    tags: ['Strategy', 'SWOT', 'Competitive'],
  },
  {
    id: 'pricing_tier_architecture',
    category: 'Business & Strategy',
    title: 'SaaS Value-Based Pricing Architecture',
    description: 'Structure revenue tiers, feature gates, and expansion revenue metrics.',
    prompt: 'Design a value-based pricing strategy for [Product Type]. Define 3 tiers (Free/Starter, Pro, Enterprise), specific feature gating criteria, metric-based expansion triggers (usage/seats), and packaging to maximize Net Revenue Retention.',
    icon: 'DollarSign',
    tags: ['Pricing', 'SaaS', 'Monetization'],
  },

  // Science & Math
  {
    id: 'math_derivation',
    category: 'Science & Math',
    title: 'Mathematical Intuition & Formal Proof',
    description: 'Derive theorems, equations, and algorithms with step-by-step intuitive rationale.',
    prompt: 'Walk me through the mathematical derivation of [Equation or Concept, e.g. Backpropagation gradient updates or Bayes Theorem with continuous distributions]. Explain the geometric intuition behind each step and provide a concrete numerical walkthrough.',
    icon: 'Sigma',
    tags: ['Math', 'Derivation', 'Calculus'],
  },
  {
    id: 'hypothesis_experiment',
    category: 'Science & Math',
    title: 'Scientific Experiment & A/B Test Design',
    description: 'Design rigorous statistical hypotheses, sample sizes, and p-value validation.',
    prompt: 'Design a statistically rigorous experiment to test the hypothesis: [State hypothesis]. Define null/alternative hypotheses, minimum detectable effect (MDE), sample size calculations, bias mitigation, and statistical test criteria.',
    icon: 'FlaskConical',
    tags: ['Science', 'Statistics', 'A/B Testing'],
  },

  // Languages & Culture
  {
    id: 'ethio_wisdom_context',
    category: 'Languages & Culture',
    title: 'Ethiopian & African Cultural Wisdom',
    description: 'Explore timeless proverbs, historical philosophy, and their modern significance.',
    prompt: 'Select 3 poignant Ethiopian proverbs (with Amharic script, phonetic pronunciation, and English translation) related to [Theme, e.g. perseverance, community, or leadership]. Provide historical context and apply them to modern dilemmas.',
    icon: 'Globe',
    tags: ['Amharic', 'Culture', 'Proverbs', 'Ethiopia'],
  },
  {
    id: 'multilingual_localization',
    category: 'Languages & Culture',
    title: 'Nuanced Multilingual Localization',
    description: 'Translate UI copy or narrative text with cultural sensitivity and idiom accuracy.',
    prompt: 'Translate and culturally adapt this copy for [Target Language & Region, e.g. Amharic, French, Spanish, Arabic]. Ensure colloquial naturalness rather than robotic literal translation. Point out cultural nuances that influenced your phrasing:\n\n"[Insert text]"',
    icon: 'Languages',
    tags: ['Translation', 'Localization', 'Polyglot'],
  },

  // Productivity
  {
    id: 'meeting_action_matrix',
    category: 'Productivity',
    title: 'Meeting Notes to Action Matrix',
    description: 'Convert messy transcripts or notes into owner-assigned action matrices.',
    prompt: 'Transform these raw meeting notes into a structured Executive Summary, Key Decisions Made, and an Action Items Table with Assignee, Deliverable, and Deadlines:\n\n[Paste raw notes]',
    icon: 'CheckSquare',
    tags: ['Productivity', 'Meeting Notes', 'Action Items'],
  },
  {
    id: 'daily_timeblock_optimizer',
    category: 'Productivity',
    title: 'High-Output Timeblocking Optimizer',
    description: 'Structure chaotic to-do lists into deep-work blocks and cognitive energy cycles.',
    prompt: 'Given this list of tasks and meetings for today: [Paste list of tasks and commitments]. Organize them into an optimal 8-hour schedule based on ultradian rhythms, grouping deep creative work into morning peaks and low-effort admin into afternoons.',
    icon: 'Clock',
    tags: ['Time Management', 'Deep Work', 'Schedule'],
  },
];
