import type { APIContext } from 'astro';
import { getAllPosts, formatDate, readingMinutes, type Post } from '../../lib/posts';
import { renderOg, type OgCell } from '../../lib/og';
import { SECTIONS, SITE } from '../../site.config';

export async function getStaticPaths() {
  const posts = await getAllPosts();
  return [
    { params: { slug: 'default' }, props: { post: undefined } },
    ...posts.map((post) => ({ params: { slug: `${post.collection}/${post.id}` }, props: { post } })),
  ];
}

function cellsFor(post: Post): OgCell[] {
  const d = post.data as Record<string, any>;
  const cells: OgCell[] = [{ label: 'Published', value: formatDate(d.date) }];
  if (post.collection === 'writeups') {
    if (d.platform) cells.push({ label: 'Platform', value: d.platform });
    if (d.severity) cells.push({ label: 'Severity', value: d.severity, severity: d.severity });
    if (d.cvss) cells.push({ label: 'CVSS', value: d.cvss });
  } else {
    if (d.tags?.[0]) cells.push({ label: 'Topic', value: d.tags[0] });
    cells.push({ label: 'Reading time', value: `${readingMinutes(post.body)} min` });
  }
  return cells;
}

export async function GET({ props }: APIContext) {
  const post = props.post as Post | undefined;
  const png = post
    ? await renderOg({
        kicker: SECTIONS[post.collection].singular,
        title: post.data.title,
        cells: cellsFor(post),
      })
    : await renderOg({
        kicker: 'Offensive security',
        title: SITE.profile.headline,
        cells: [
          { label: 'Writeups', value: 'Bug bounty' },
          { label: 'Notes', value: 'Threats and tools' },
          { label: 'Focus', value: 'AI and LLM security' },
        ],
      });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
}
