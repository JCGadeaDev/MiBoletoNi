import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/api/'], // Protegemos áreas privadas
    },
    sitemap: 'https://miboletoni.com/sitemap.xml',
  };
}