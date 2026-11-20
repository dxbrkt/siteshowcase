/** Prefix local URLs for installations under a GitHub Pages repository path. */
export function withBase(url: string): string {
  if (!url.startsWith('/') || url.startsWith('//')) return url;
  return import.meta.env.BASE_URL.replace(/\/$/, '') + url;
}
