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
    linkedin: '',
    x: '',
    email: '',
  },
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
