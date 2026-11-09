/** Static content for the two Resources user stories. No API calls are needed. */
export const RESOURCE_PAGES = [
  {
    id: 'about',
    label: 'About Summit',
    shortLabel: 'About',
    icon: 'info',
    href: '/resources/about',
  },
  {
    id: 'rules',
    label: 'Summit Rules',
    shortLabel: 'Rules',
    icon: 'shield',
    href: '/resources/rules',
  },
  {
    id: 'user-agreement',
    label: 'User Agreement',
    shortLabel: 'Agreement',
    icon: 'document',
    href: '/resources/user-agreement',
  },
  {
    id: 'careers',
    label: 'Careers',
    shortLabel: 'Careers',
    icon: 'briefcase',
    href: '/resources/careers',
  },
] as const;

export type ResourcePage = (typeof RESOURCE_PAGES)[number]['id'];

export const COMMUNITY_RULES = [
  {
    title: 'Remember the human',
    text: 'Summit is a place for community and belonging. Everyone has a right to participate free from harassment, bullying, threats, and hate. Do not attack marginalized or vulnerable groups, incite violence, or promote hate based on identity or vulnerability.',
  },
  {
    title: 'Respect community rules',
    text: 'Participate authentically in communities where you have a personal interest. Follow the rules of each community. Do not spam, manipulate votes or content, or engage in disruptive behavior that interferes with other communities.',
  },
  {
    title: 'Protect everyone’s privacy',
    text: 'Respect the privacy and safety of others. Never reveal someone’s personal or confidential information to encourage harassment. Do not post or threaten to post intimate or sexually explicit images or videos of someone without their consent.',
  },
  {
    title: 'Keep minors safe',
    text: 'Do not share or encourage sexual, abusive, or suggestive content involving minors. Predatory or inappropriate behavior involving a minor is strictly prohibited.',
  },
  {
    title: 'Be authentic',
    text: 'You do not have to use your real name, but do not intentionally mislead others. Do not impersonate an individual or organization in a deceptive way.',
  },
  {
    title: 'Label sensitive content',
    text: 'Help people have predictable experiences. Clearly label content that is graphic, sexually explicit, or potentially offensive, and follow the community’s content restrictions. A label does not make prohibited content acceptable.',
  },
  {
    title: 'Keep it legal',
    text: 'Do not post illegal content, and do not solicit or facilitate illegal or prohibited transactions. You are responsible for the content you share and for following the laws that apply to you.',
  },
  {
    title: 'Don’t break the platform',
    text: 'Do not interfere with the normal use of Summit. Do not disrupt the service, bypass security measures, or use the platform in ways that prevent others from participating.',
  },
] as const;

export const RULES_INTRO = [
  'Summit is a network of communities created, shaped, and populated by people like you. Here, you can post, comment, vote, discuss, learn, debate, support, and connect with people who share your interests.',
  'Not every community will be for you, and you may find some discussions unfamiliar or offensive. But no community should be used as a weapon. Communities should create a sense of belonging for their members without diminishing it for others.',
  'Every community is shaped by its members, its rules, and its conversations. Respect the communities you participate in, and do not interfere with those where you are not a member. The platform-wide rules below apply to everyone.',
  'Summit is what we make of it together. Please respect both the letter of these rules and the spirit behind them.',
] as const;

export const ENFORCEMENT_ACTIONS = [
  'A reminder or warning about the rules.',
  'Removal of content that violates the rules.',
  'Limits on account privileges or community participation.',
  'Temporary or permanent account suspension.',
  'Restrictions on, or removal of, communities that violate the rules.',
] as const;

export const PARTICIPATION = [
  {
    number: '01',
    icon: 'plus',
    title: 'Post your perspective',
    text: 'Share a thought, a question, or a photo with a community that gets it.',
  },
  {
    number: '02',
    icon: 'comment',
    title: 'Join the conversation',
    text: 'Exchange ideas, ask questions, and learn from another point of view.',
  },
  {
    number: '03',
    icon: 'up',
    title: 'Shape what rises',
    text: 'Vote on posts and comments to help useful conversations find their audience.',
  },
] as const;

export const CAREER_VALUES = [
  {
    icon: 'comment',
    title: 'Community comes first',
    text: 'Start with the people using Summit. Listen closely and build around their needs.',
  },
  {
    icon: 'discover',
    title: 'Stay curious',
    text: 'Ask questions, explore new ideas, and learn from different perspectives.',
  },
  {
    icon: 'up',
    title: 'Build together',
    text: 'Share what you know, support your teammates, and make steady progress.',
  },
] as const;
