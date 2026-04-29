import type { MetadataRoute } from 'next';

const BASE = 'https://justixia.app';
const today = new Date().toISOString().slice(0, 10);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`,             lastModified: today, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/demo`,         lastModified: today, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/consultation`, lastModified: today, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/tribunal`,     lastModified: today, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/pricing`,      lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/sign-up`,      lastModified: today, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/sign-in`,      lastModified: today, changeFrequency: 'monthly', priority: 0.4 },
  ];
}
