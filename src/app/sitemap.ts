import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase'; 

// Esto obliga a Next.js a regenerar el sitemap y no servir una versión vieja
export const dynamic = 'force-dynamic';
export const revalidate = 0; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://miboletoni.com';

  // 1. Rutas Estáticas
  const routes = [
    '', 
    '/events', 
    '/auth/login', 
    '/auth/register', 
    '/terms', 
    '/faq', 
    '/privacy', 
    '/puntos-de-venta', 
    '/about', 
    '/contact'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(), // Formato ISO estricto para Google
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Rutas Dinámicas (Eventos)
  try {
    const eventsSnap = await getDocs(collection(db, 'events'));
    const eventRoutes = eventsSnap.docs.map(doc => ({
      url: `${baseUrl}/events/${doc.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));
    return [...routes, ...eventRoutes];
  } catch (e) {
    console.error("Error generating sitemap:", e);
    return routes;
  }
}