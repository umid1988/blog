import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Fields every post has.
const base = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  // Drafts show up in `npm run dev` but are left out of the published site.
  draft: z.boolean().default(false),
});

const writeups = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writeups' }),
  schema: base.extend({
    platform: z.string().optional(), // HackerOne, Yandex, HackTheBox, ...
    program: z.string().optional(), // program or box name
    target: z.string().optional(), // affected asset, e.g. api.example.com
    severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).optional(),
    status: z.string().optional(), // Resolved, Disclosed, Duplicate, ...
    cvss: z.string().optional(), // score, e.g. "7.3"
    cvssVector: z.string().optional(), // e.g. AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:N
    report: z.string().optional(), // report ID from the program
    cve: z.string().optional(),
    cwe: z.string().optional(),
    reported: z.coerce.date().optional(),
    disclosed: z.coerce.date().optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: base.extend({
    // Where the note was first published, e.g. a LinkedIn article.
    source: z.string().url().optional(),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: base.extend({
    // Optional link to the original announcement or article.
    source: z.string().url().optional(),
  }),
});

export const collections = { writeups, notes, news };
