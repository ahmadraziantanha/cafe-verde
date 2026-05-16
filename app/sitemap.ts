import type { MetadataRoute } from 'next';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cafe-verde.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/menu`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${siteUrl}/signup`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ];
}
