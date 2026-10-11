import { Post } from '../types/post.types';

export const mockPosts: Post[] = [
  {
    id: '1',
    community: 'AskReddit',
    author: 'confetti_logic',
    timeAgo: '2 days ago',

    title:
      "What's a skill that took you years to learn but you now do on autopilot?",

    description:
      'Share something that was difficult at first but now feels natural.',

    category: 'Discussion',

    tags: [
      'Discussion',
      'Skills',
      'Learning',
    ],

    voteCount: 74300,
    replyCount: 38400,

    summaryTone: 'Light-hearted',

    aiSummary:
      'Most replies share everyday skills that became automatic after years of practice. Many users mention driving, typing, cooking, music, and work-related skills.',
  },

  {
    id: '2',
    community: 'worldnews',
    author: 'dispatch_nine',
    timeAgo: '5 hours ago',

    title:
      'Iceland approves four-day workweek as national standard after decade-long pilot',

    description:
      'The government cited productivity data showing that output stayed steady while worker wellbeing improved.',

    category: 'Policy',

    tags: [
      'Labor',
      'Iceland',
      'Policy',
    ],

    voteCount: 121400,
    replyCount: 5600,

    summaryTone: 'Broad consensus',

    aiSummary:
      'Most replies support the shorter workweek and discuss possible benefits for productivity and wellbeing. Some users question whether the same policy would work in every industry.',
  },

  {
    id: '3',
    community: 'technology',
    author: 'neonpulse42',
    timeAgo: '3 hours ago',

    title:
      'OpenAI announces a new AI model with a larger context window',

    description:
      'The model can process larger documents and codebases in a single prompt. Users are discussing how useful this may be for research and software development.',

    category: 'AI',

    tags: [
      'AI',
      'OpenAI',
      'LLM',
    ],

    voteCount: 48300,
    replyCount: 2800,

    summaryTone: 'Divided opinions',

    aiSummary:
      'Many users are interested in the larger context window, but others are skeptical about real-world performance, cost, and whether larger context always improves results.',
  },

  {
    id: '4',
    community: 'space',
    author: 'orbital_dreams',
    timeAgo: '1 day ago',

    title:
      'James Webb captures new infrared image of distant dwarf galaxies',

    description:
      'Astronomers say the observations may help researchers understand some of the earliest structures in the universe.',

    category: 'Astronomy',

    tags: [
      'JWST',
      'Astronomy',
      'Space',
    ],

    voteCount: 89000,
    replyCount: 2100,

    summaryTone: 'Informative thread',

    aiSummary:
      'The discussion focuses on what the new observations may tell scientists about early galaxy formation. Several replies also explain the limits of current measurements.',
  },

  {
    id: '5',
    community: 'programming',
    author: 'stderr_wizard',
    timeAgo: '12 hours ago',

    title:
      "I spent six months rewriting our backend from Node.js to Rust. Here's what I learned.",

    description:
      'The author reports lower latency and memory use, but also discusses development time, team experience, and maintenance costs.',

    category: 'Backend',

    tags: [
      'Rust',
      'Backend',
      'Engineering',
    ],

    voteCount: 22400,
    replyCount: 1400,

    summaryTone: 'Divided opinions',

    aiSummary:
      'Some developers like the performance improvements, while others argue that the extra complexity and development cost may not be worth it for every project.',
  },
];