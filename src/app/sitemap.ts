import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE = 'https://www.bhooklagi.in';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`,               changeFrequency: 'daily',   priority: 1 },
    { url: `${BASE}/menu`,           changeFrequency: 'daily',   priority: 0.95 },
    { url: `${BASE}/offers`,         changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/contact`,        changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/privacy-policy`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/terms`,          changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/refund-policy`,  changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/delivery-policy`,changeFrequency: 'monthly', priority: 0.3 },
  ];
}
