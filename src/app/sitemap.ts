import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://miboletoni.com';

  // 1. Rutas Estáticas
  const routes = ['', '/events', '/auth/login', '/auth/register', '/terms', '/faq', '/privacy', '/puntos-de-venta', '/about', '/contact'].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Rutas Dinámicas (Eventos)
  try {
    const eventsSnap = await getDocs(collection(db, 'events'));
    const eventRoutes = eventsSnap.docs.map(doc => ({
      url: `${baseUrl}/events/${doc.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));
    return [...routes, ...eventRoutes];
  } catch (e) {
    return routes;
  }
}