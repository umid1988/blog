// Builds the 1200x630 preview images shown when a page is shared on
// LinkedIn, Telegram, X and so on. Rendered at build time with satori
// (layout to SVG) and sharp (SVG to PNG).
import satori from 'satori';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const C = {
  bg: '#10314f',
  ink: '#edf2f5',
  soft: '#a9bed1',
  rule: '#2e5479',
  red: '#ff7a7a',
};

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  props: { style, children: children.flat().filter((c) => c !== null && c !== undefined && c !== false) },
});

let fontsPromise: Promise<{ name: string; data: Buffer; weight: 400 | 600 | 800; style: 'normal' }[]>;
function fonts() {
  fontsPromise ??= (async () => {
    const dir = join(process.cwd(), 'node_modules/@fontsource/archivo/files');
    const load = async (subset: string, weight: 400 | 600 | 800) => ({
      name: 'Archivo',
      data: await readFile(join(dir, `archivo-${subset}-${weight}-normal.woff`)),
      weight,
      style: 'normal' as const,
    });
    return Promise.all(
      (['latin', 'latin-ext'] as const).flatMap((s) => [load(s, 400), load(s, 600), load(s, 800)]),
    );
  })();
  return fontsPromise;
}

export type OgCell = { label: string; value: string; severity?: string };

export interface OgInput {
  kicker: string; // e.g. "Writeup"
  title: string;
  cells: OgCell[];
}

function severityBars(level: string) {
  const filled = { info: 0, low: 1, medium: 2, high: 3, critical: 4 }[level] ?? 0;
  const color = level === 'critical' ? C.red : C.ink;
  return h(
    'div',
    { display: 'flex', alignItems: 'center', gap: 14 },
    h(
      'div',
      { display: 'flex', gap: 4 },
      [1, 2, 3, 4].map((n) =>
        h('div', {
          width: 11,
          height: 24,
          border: `2.5px solid ${color}`,
          borderRadius: 2,
          backgroundColor: n <= filled ? color : 'transparent',
        }),
      ),
    ),
    h('div', { color }, level.charAt(0).toUpperCase() + level.slice(1)),
  );
}

export async function renderOg({ kicker, title, cells }: OgInput): Promise<Buffer> {
  const size = title.length > 90 ? 50 : title.length > 60 ? 58 : 68;

  const tree = h(
    'div',
    {
      // satori sizes boxes without their padding, so subtract it here
      width: 1200 - 128,
      height: 630 - 116,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '56px 64px 60px',
      backgroundColor: C.bg,
      // faint blueprint grid
      backgroundImage: `linear-gradient(${C.rule}55 1px, transparent 1px), linear-gradient(90deg, ${C.rule}55 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      color: C.ink,
      fontFamily: 'Archivo',
    },
    h(
      'div',
      { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
      h('div', { fontSize: 40, fontWeight: 800, letterSpacing: -1 }, 'zerosec'),
      h('div', { fontSize: 26, fontWeight: 600, color: C.soft }, kicker),
    ),
    h(
      'div',
      {
        display: 'flex',
        fontSize: size,
        fontWeight: 800,
        lineHeight: 1.08,
        letterSpacing: -1.5,
        maxWidth: 1040,
        lineClamp: 3,
      },
      title,
    ),
    cells.length > 0 &&
      h(
        'div',
        { display: 'flex', border: `3px solid ${C.ink}`, backgroundColor: C.bg },
        cells.map((cell, i) =>
          h(
            'div',
            {
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              flexBasis: 0,
              padding: '14px 20px 16px',
              borderLeft: i === 0 ? 'none' : `1.5px solid ${C.ink}`,
            },
            h('div', { fontSize: 19, color: C.soft, marginBottom: 6 }, cell.label),
            cell.severity
              ? h('div', { display: 'flex', fontSize: 28, fontWeight: 600 }, severityBars(cell.severity))
              : h('div', { display: 'flex', fontSize: 28, fontWeight: 600 }, cell.value),
          ),
        ),
      ),
  );

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: await fonts() });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
