// Site-wide settings. Edit these to change the name, description and links.
// Empty links are hidden.
export const SITE = {
  title: 'Zerosec',
  description:
    'Writeups, notes and news from Zerosec, an offensive security researcher and bug bounty hunter.',
  author: 'Zerosec',
  lang: 'en',
  links: {
    github: 'https://github.com/umid1988',
    hackerone: '',
    linkedin: 'https://www.linkedin.com/in/umid-norbekov-b13806385/',
    medium: 'https://medium.com/@umidnorbekov',
    x: '',
    email: '',
  },
  // The introduction block at the top of the home page.
  profile: {
    headline: 'I find vulnerabilities in web apps and AI systems, and write up how.',
    focus: ['Web and API security', 'AI and LLM security', 'Penetration testing', 'OSINT'],
    platforms: ['HackerOne', 'Yandex Bug Bounty', 'HackTheBox'],
    certifications: ['eJPT', 'eCPPT', 'OSCP (in progress)'],
  },
};

// The free course, linked from the main menu and the home page.
// It lives in its own repo (umid1988/ai-sec), so the address is absolute
// and stays the same when the blog moves to a custom domain.
// Set url to '' to hide it everywhere.
export const COURSE = {
  url: 'https://umid1988.github.io/ai-sec/',
  navLabel: 'Course',
  kicker: 'Free course · in Uzbek',
  title: 'AI Red Teaming & LLM Security',
  description:
    'Sixteen hands-on lessons, from prompt injection and trust boundaries to RAG, AI agents, MCP and a full AI red team audit.',
  facts: [
    { label: 'Lessons', value: '16' },
    { label: 'Level', value: 'Beginner to advanced' },
    { label: 'Language', value: 'Uzbek' },
    { label: 'Includes', value: 'Python labs, quiz' },
  ],
  cta: 'Open the course',
};

// The three sections of the blog. The key is the URL path and the
// folder name under src/content/.
export const SECTIONS = {
  writeups: {
    name: 'Writeups',
    singular: 'Writeup',
    blurb:
      'Vulnerability reports and walkthroughs: what I found, how I found it, and how it was fixed.',
    empty: 'No writeups published yet.',
  },
  notes: {
    name: 'Notes',
    singular: 'Note',
    blurb: 'Working notes on tools, techniques and things worth remembering.',
    empty: 'No notes published yet.',
  },
  news: {
    name: 'News',
    singular: 'News',
    blurb: 'Short updates on research, releases, talks and disclosures.',
    empty: 'No news yet.',
  },
} as const;

export type SectionKey = keyof typeof SECTIONS;
export const SECTION_KEYS = Object.keys(SECTIONS) as SectionKey[];
