import type { BlogPost } from './types';

// This file is for static or placeholder data.
// Event data is now fetched directly from Firestore.
export const popularEvents: any[] = [];
export const allEvents: any[] = [];


export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Los 5 mejores conciertos que llegan a Nicaragua este año',
    author: 'Ana López',
    date: '10 de Julio, 2024',
    image: 'blog-1',
    excerpt: 'Prepara tu agenda, porque la escena musical nicaragüense está que arde. Te contamos cuáles son los conciertos que no te puedes perder...',
    category: 'Música',
  },
  {
    id: '2',
    title: 'Entrevista con "CargaCerrada": El futuro del rock nica',
    author: 'Carlos Martinez',
    date: '05 de Julio, 2024',
    image: 'blog-2',
    excerpt: 'Hablamos con la banda del momento sobre su nuevo disco, sus influencias y lo que significa hacer rock en Nicaragua hoy.',
    category: 'Entrevistas',
  },
  {
    id: '3',
    title: 'Guía para no perderte nada del Festival de Poesía de Granada',
    author: 'Sofía Reyes',
    date: '01 de Julio, 2024',
    image: 'blog-3',
    excerpt: 'El evento cultural más importante del país está a la vuelta de la esquina. Aquí tienes nuestros mejores consejos para disfrutarlo al máximo.',
    category: 'Guías',
  },
];
