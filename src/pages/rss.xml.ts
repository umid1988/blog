import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllPosts, postUrl } from '../lib/posts';
import { SITE, SECTIONS } from '../site.config';
import { url } from '../lib/url';

export async function GET(context: APIContext) {
  const posts = await getAllPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: new URL(url('/'), context.site).href,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postUrl(post),
      categories: [SECTIONS[post.collection].name, ...post.data.tags],
    })),
    customData: `<language>${SITE.lang}</language>`,
  });
}
