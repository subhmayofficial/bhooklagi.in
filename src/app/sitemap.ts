import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.bhooklagi.in';
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/offers`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/delivery-policy`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    }
  ];
}
