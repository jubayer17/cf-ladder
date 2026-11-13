import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://cf-ladder-pro.vercel.app';
  return ['', '/contests', '/topics'].map(path => ({ url: `${base}${path}`, changeFrequency: 'weekly', priority: path ? 0.8 : 1 }));
}
