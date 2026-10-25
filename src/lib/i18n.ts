// Labels for post pages, so a post written in another language (set with
// `lang` in its front matter) gets matching labels. English is the default.
const LABELS = {
  en: {
    published: 'Published',
    updated: 'Updated',
    readingTime: 'Reading time',
    minutes: (n: number) => `${n} min`,
    tags: 'Tags',
    source: 'Source',
    firstPublishedOn: 'First published on',
    topic: 'Topic',
    contents: 'Contents',
    older: 'Older',
    newer: 'Newer',
    note: 'Note',
  },
  uz: {
    published: 'Eʼlon qilingan',
    updated: 'Yangilangan',
    readingTime: 'Oʻqish vaqti',
    minutes: (n: number) => `${n} daqiqa`,
    tags: 'Teglar',
    source: 'Manba',
    firstPublishedOn: 'Birinchi eʼlon qilingan joy',
    topic: 'Mavzu',
    contents: 'Mundarija',
    older: 'Oldingisi',
    newer: 'Keyingisi',
    note: 'Eslatma',
  },
} as const;

export type Labels = (typeof LABELS)['en'];

export function labels(lang?: string): Labels {
  const key = (lang ?? 'en').toLowerCase().split('-')[0] as keyof typeof LABELS;
  return (LABELS[key] ?? LABELS.en) as Labels;
}

const UZ_MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];

// Uzbek dates read "2026-yil 25-oktabr".
export function formatDateFor(date: Date, lang: string | undefined, fallback: (d: Date) => string) {
  if ((lang ?? '').startsWith('uz')) {
    return `${date.getUTCFullYear()}-yil ${date.getUTCDate()}-${UZ_MONTHS[date.getUTCMonth()]}`;
  }
  return fallback(date);
}
