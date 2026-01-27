'use client';

import React, { useEffect, useState, Suspense, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// --- Importaciones de Firebase y Hooks ---
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

// --- Importaciones de Componentes de UI ---
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, CalendarDays, Loader2, Ticket } from 'lucide-react';
import { EventContext } from '@/context/EventContext';
import { motion } from 'framer-motion';

// --- Definición de Tipos ---
import type { Event, Presentation, Venue, CombinedEvent } from '@/lib/types';

// --- Tarjeta de Evento (OPTIMIZADA: Sin recortes y sin error de Badge) ---
const EventCard = ({ event }: { event: CombinedEvent }) => (
  <motion.div
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 group rounded-[2.5rem] bg-card">
      <Link href={`/events/${event.id}`} className="block h-full flex flex-col">
        
        {/* CONTENEDOR DE IMAGEN CON BLUR BACKGROUND */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
          {/* 1. Fondo difuminado para rellenar huecos laterales/verticales */}
          <div className="absolute inset-0 z-0">
            <Image 
              src={event.imageUrl || 'https://placehold.co/600x400/F24CA1/ffffff?text=Evento'} 
              alt="background-blur"
              fill
              className="object-cover blur-2xl opacity-40 scale-125"
              unoptimized
            />
          </div>

          {/* 2. Imagen Principal (Contain) - NO SE CORTA NUNCA */}
          <div className="absolute inset-0 z-10 flex items-center justify-center p-2">
            <Image 
              src={event.imageUrl || 'https://placehold.co/600x400/F24CA1/ffffff?text=Evento'} 
              alt={`Imagen de ${event.name}`} 
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          </div>

          {/* 3. Badge personalizado (Usando span para evitar error de importación) */}
          <div className="absolute top-4 left-4 z-20">
            <span className="inline-flex items-center justify-center bg-primary/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border border-white/10">
              {event.category}
            </span>
          </div>
          
          <div className="absolute inset-0 z-15 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <CardContent className="p-6 flex flex-col flex-grow bg-white dark:bg-zinc-900">
          <h3 className="text-xl font-black text-foreground mb-3 line-clamp-1 group-hover:text-primary transition-colors">
            {event.name}
          </h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="truncate">{event.city} • {event.venue}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span>{event.date}</span>
            </div>
          </div>

          <Button className="w-full rounded-xl font-bold mt-auto group-hover:bg-primary group-hover:text-white transition-all">
            Ver Detalle
          </Button>
        </CardContent>
      </Link>
    </Card>
  </motion.div>
);

// --- Componente de Contenido ---
function EventsPageContent() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { events: allEvents, setEvents } = useContext(EventContext);
  
  const [filteredEvents, setFilteredEvents] = useState<CombinedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [category, setCategory] = useState(searchParams.get('category') || 'Todos');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortOrder, setSortOrder] = useState('date-asc');
  
  const eventsQuery = useMemoFirebase(() => query(collection(firestore, "events")), [firestore]);
  const presentationsQuery = useMemoFirebase(() => query(collection(firestore, "presentations")), [firestore]);
  const venuesQuery = useMemoFirebase(() => query(collection(firestore, "venues")), [firestore]);

  const { data: eventsData, isLoading: loadingEvents } = useCollection<Event>(eventsQuery);
  const { data: presentationsData, isLoading: loadingPresentations } = useCollection<Presentation>(presentationsQuery);
  const { data: venuesData, isLoading: loadingVenues } = useCollection<Venue>(venuesQuery);

  const areDataLoading = loadingEvents || loadingPresentations || loadingVenues;

  useEffect(() => {
    if (areDataLoading || !eventsData || !presentationsData || !venuesData) return;

    const eventMap = new Map(eventsData.map(e => [e.id, e]));
    const venueMap = new Map(venuesData.map(v => [v.id, v]));

    const upcomingPresentations = presentationsData
        .filter(p => p.eventDate && p.eventDate.toDate() >= new Date())
        .sort((a, b) => a.eventDate.toMillis() - b.eventDate.toMillis());

    const uniqueEvents = new Map<string, CombinedEvent>();

    upcomingPresentations.forEach(p => {
        const eventDate = p.eventDate?.toDate();
        if (!uniqueEvents.has(p.eventId) && eventDate) {
            const event = eventMap.get(p.eventId);
            const venue = venueMap.get(p.venueId);

            if (event && venue) {
                uniqueEvents.set(p.eventId, {
                    id: p.eventId,
                    name: event.name,
                    category: event.category,
                    description: event.description || '',
                    imageUrl: event.imageUrl || `https://picsum.photos/seed/${event.id}/800/600`,
                    city: venue.city,
                    venue: venue.name,
                    date: eventDate.toLocaleDateString('es-NI', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    }),
                    rawDate: eventDate,
                });
            }
        }
    });

    const combinedData = Array.from(uniqueEvents.values());
    setEvents(combinedData);
    setIsLoading(false);
  }, [eventsData, presentationsData, venuesData, areDataLoading, setEvents]);

  useEffect(() => {
    let eventsToProcess = [...allEvents];

    if (category !== 'Todos') {
      eventsToProcess = eventsToProcess.filter(event => event.category === category);
    }
    if (searchTerm) {
      eventsToProcess = eventsToProcess.filter(event => 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    eventsToProcess.sort((a, b) => {
      if (!a.rawDate || !b.rawDate) return 0;
      switch (sortOrder) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'date-desc': return b.rawDate.getTime() - a.rawDate.getTime();
        case 'date-asc':
        default: return a.rawDate.getTime() - b.rawDate.getTime();
      }
    });

    setFilteredEvents(eventsToProcess);
  }, [searchTerm, category, sortOrder, allEvents]);

  const categoriesList = ['Todos', 'Conciertos y Festivales', 'Teatro', 'Deportes', 'Expo y Ferias'];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-lg font-bold text-muted-foreground animate-pulse">Buscando los mejores eventos...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
            <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tight mb-4">
              Todos los Eventos
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium">
                Encuentra tu próxima experiencia inolvidable en Nicaragua.
            </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-12 p-6 bg-white dark:bg-zinc-900 border-none shadow-xl rounded-[2rem]">
            <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <Input 
                    placeholder="Buscar por evento, ciudad o recinto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 rounded-xl bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary"
                />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full sm:w-[220px] h-12 rounded-xl bg-muted/50 border-none">
                        <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        {categoriesList.map(cat => <SelectItem key={cat} value={cat} className="rounded-lg">{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl bg-muted/50 border-none">
                        <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="date-asc" className="rounded-lg">Próximos</SelectItem>
                        <SelectItem value="date-desc" className="rounded-lg">Más Lejanos</SelectItem>
                        <SelectItem value="name-asc" className="rounded-lg">Nombre (A-Z)</SelectItem>
                        <SelectItem value="name-desc" className="rounded-lg">Nombre (Z-A)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[3rem] shadow-inner border border-dashed">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-black text-foreground">No hay coincidencias</h3>
                <p className="text-muted-foreground mt-2 font-medium">Intenta ajustar los filtros.</p>
                 <Button variant="outline" className="mt-8 rounded-full px-8" onClick={() => { setSearchTerm(''); setCategory('Todos'); }}>
                   Ver todos los eventos
                 </Button>
            </div>
        )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>}>
      <EventsPageContent />
    </Suspense>
  );
}