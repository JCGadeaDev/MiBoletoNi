
'use client';

import React, { useEffect, useState, useMemo, Suspense, useContext } from 'react';
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
import { Search } from 'lucide-react';
import { EventContext } from '@/context/EventContext';


// --- Definición de Tipos ---
import type { Event, Presentation, Venue, CombinedEvent } from '@/lib/types';


// --- Tarjeta de Evento ---
const EventCard = ({ event }: { event: CombinedEvent }) => (
  <Card className="overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group">
    <Link href={`/events/${event.id}`} className="block h-full flex flex-col">
      <div className="relative h-56 w-full">
        <Image 
          className="object-cover" 
          src={event.imageUrl || 'https://placehold.co/600x400/F24CA1/ffffff?text=Evento'} 
          alt={`Imagen de ${event.name}`} 
          fill
          unoptimized
        />
      </div>
      <CardContent className="p-5 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-card-foreground mb-2 truncate">{event.name}</h3>
        <p className="text-muted-foreground mb-1 font-semibold">{event.city}</p>
        <p className="text-muted-foreground mb-4 text-sm">{event.date}</p>
        <div className="mt-auto">
            <span className="inline-block bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            {event.category}
            </span>
        </div>
      </CardContent>
    </Link>
  </Card>
);


// --- Componente de Contenido de la Página de Eventos ---
function EventsPageContent() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { events: allEvents, setEvents } = useContext(EventContext);
  
  // --- Estados de Datos ---
  const [filteredEvents, setFilteredEvents] = useState<CombinedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Estados de Filtros ---
  const [category, setCategory] = useState(searchParams.get('category') || 'Todos');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortOrder, setSortOrder] = useState('date-asc');
  
  // --- Carga de Datos Inicial ---
  const eventsQuery = useMemoFirebase(() => query(collection(firestore, "events")), [firestore]);
  const presentationsQuery = useMemoFirebase(() => query(collection(firestore, "presentations")), [firestore]);
  const venuesQuery = useMemoFirebase(() => query(collection(firestore, "venues")), [firestore]);

  const { data: eventsData, isLoading: loadingEvents } = useCollection<Event>(eventsQuery);
  const { data: presentationsData, isLoading: loadingPresentations } = useCollection<Presentation>(presentationsQuery);
  const { data: venuesData, isLoading: loadingVenues } = useCollection<Venue>(venuesQuery);

  const areDataLoading = loadingEvents || loadingPresentations || loadingVenues;

  useEffect(() => {
    if (areDataLoading || !eventsData || !presentationsData || !venuesData) {
        return;
    }

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
                    // Store the actual date object for sorting
                    rawDate: eventDate,
                });
            }
        }
    });

    const combinedData = Array.from(uniqueEvents.values());
    setEvents(combinedData);
    setIsLoading(false);
  }, [eventsData, presentationsData, venuesData, areDataLoading, setEvents]);

  // --- Lógica de Filtrado y Ordenación ---
  useEffect(() => {
    let eventsToProcess = [...allEvents];

    // Filtrar
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

    // Ordenar
    eventsToProcess.sort((a, b) => {
      // Ensure rawDate exists before sorting
      if (!a.rawDate || !b.rawDate) return 0;
      switch (sortOrder) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-desc':
          return b.rawDate.getTime() - b.rawDate.getTime();
        case 'date-asc':
        default:
          return a.rawDate.getTime() - b.rawDate.getTime();
      }
    });

    setFilteredEvents(eventsToProcess);
  }, [searchTerm, category, sortOrder, allEvents]);


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const categories = ['Todos', 'Conciertos y Festivales', 'Teatro', 'Deportes', 'Expo y Ferias'];

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg font-medium text-foreground">Cargando eventos...</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Todos los Eventos</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Encuentra tu próxima experiencia. Filtra por categoría, busca por nombre o explora lo que está por venir.
            </p>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-card border rounded-lg shadow-sm">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Buscar por evento, ciudad o recinto..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10"
                />
            </div>
            <div className="flex gap-4">
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date-asc">Próximos</SelectItem>
                        <SelectItem value="date-desc">Más Lejanos</SelectItem>
                        <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* Cuadrícula de Eventos */}
        {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 bg-card rounded-lg shadow-sm border">
                <h3 className="text-xl font-medium text-card-foreground">No se encontraron eventos</h3>
                <p className="text-muted-foreground mt-2">
                    Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.
                </p>
                 <Button className="mt-6" onClick={() => { setSearchTerm(''); setCategory('Todos'); }}>Limpiar Búsqueda</Button>
            </div>
        )}
    </div>
  );
}

// --- Componente Principal de la Página con Suspense de Next.js ---
export default function EventsPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EventsPageContent />
    </Suspense>
  );
}
