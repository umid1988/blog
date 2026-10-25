// Builds links that work both on umid1988.github.io/blog/ and on a custom domain.
const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

export function url(path = '/'): string {
  const clean = path.replace(/^\/+/, '');
  return `${base}/${clean}`;
}
