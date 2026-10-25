import { getCollection, type CollectionEntry } from 'astro:content';
import { SECTION_KEYS, type SectionKey } from '../site.config';
import { url } from './url';

export type Post =
  | CollectionEntry<'writeups'>
  | CollectionEntry<'notes'>
  | CollectionEntry<'news'>;

const isVisible = ({ data }: { data: { draft: boolean } }) =>
  import.meta.env.PROD ? !data.draft : true;

const byDateDesc = (a: Post, b: Post) => b.data.date.valueOf() - a.data.date.valueOf();

export async function getPosts(section: SectionKey): Promise<Post[]> {
  const posts = (await getCollection(section, isVisible)) as Post[];
  return posts.sort(byDateDesc);
}

export async function getAllPosts(): Promise<Post[]> {
  const lists = await Promise.all(SECTION_KEYS.map((key) => getPosts(key)));
  return lists.flat().sort(byDateDesc);
}

export function postUrl(post: Post): string {
  return url(`${post.collection}/${post.id}/`);
}

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function tagUrl(tag: string): string {
  return url(`tags/${tagSlug(tag)}/`);
}

export function readingMinutes(body: string | undefined): number {
  if (!body) return 1;
  const text = body.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "25 Oct 2026"
export function formatDate(date: Date): string {
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
