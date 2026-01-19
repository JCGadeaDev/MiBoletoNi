
'use client';

import React, { useEffect, useState, useMemo, Suspense, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// --- Importaciones de Firebase y Hooks ---
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

// --- Importaciones de Componentes de UI ---
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";
import { SponsorCarousel } from '@/components/shared/sponsor-carousel';
import { AboutSection, WhyUsSection } from '@/components/shared/home-sections';
import { EventContext } from '@/context/EventContext';

// --- Definición de Tipos ---
import type { Event, Presentation, Venue, CombinedEvent, WithId } from '@/lib/types';


// --- Componentes de UI Internos ---

// --- Carrusel del Hero ---
const HeroCarousel = ({ events }: { events: CombinedEvent[] }) => {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        if (!api) return;
        setCurrent(api.selectedScrollSnap());
        api.on("select", () => {
        setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    if (events.length === 0) return null;

    return (
        <Carousel
            setApi={setApi}
            plugins={[Autoplay({ delay: 5000 })]}
            opts={{ loop: true }}
            className="relative w-full rounded-2xl shadow-xl overflow-hidden mb-12"
        >
            <CarouselContent>
            {events.map((event, index) => (
                <CarouselItem key={event.id}>
                    <div className="relative aspect-video w-full h-[450px]">
                        <Image
                            src={event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/800`}
                            alt={event.name}
                            fill
                            className="object-cover object-center"
                            priority={index < 2}
                            unoptimized
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />
                        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 shadow-lg">{event.name}</h1>
                            <p className="text-xl text-gray-200 mb-2 shadow-sm">{event.city} | {event.venue}</p>
                            <p className="text-lg text-gray-200 mb-6 shadow-sm">{event.date}</p>
                            <Button asChild size="lg" className="w-fit">
                               <Link href={`/events/${event.id}`}>Ver Detalles</Link>
                            </Button>
                        </div>
                    </div>
                </CarouselItem>
            ))}
            </CarouselContent>
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {events.map((_, index) => (
                <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`h-2 w-2 rounded-full transition-all ${current === index ? 'w-4 bg-primary' : 'bg-white/80'}`}
                    aria-label={`Ir a la diapositiva ${index + 1}`}
                />
                ))}
            </div>
        </Carousel>
    );
};

const categories = [
    { 
        name: "Todos", 
        imageHint: "concert crowd"
    },
    { 
        name: "Conciertos y Festivales", 
        imageHint: "music festival"
    },
    { 
        name: "Teatro", 
        imageHint: "theater stage"
    },
    { 
        name: "Deportes", 
        imageHint: "sports stadium"
    },
    { 
        name: "Expo y Ferias", 
        imageHint: "expo hall"
    },
];

const CategorySelector = ({ selected, onSelect }: { selected: string, onSelect: (category: string) => void }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
    {categories.map((category, index) => (
      <div
        key={category.name}
        onClick={() => onSelect(category.name)}
        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group transform hover:scale-105 transition-transform duration-300 shadow-lg"
      >
        <Image
          src={`https://picsum.photos/seed/${index + 10}/800/600`}
          alt={`Categoría ${category.name}`}
          fill
          className="object-cover"
          data-ai-hint={category.imageHint}
        />
        <div className={`absolute inset-0 flex items-center justify-center p-4 text-center transition-all duration-300 bg-black/50 group-hover:bg-primary/70`}>
          <h3 className="text-white text-xl font-bold drop-shadow-md">{category.name}</h3>
        </div>
      </div>
    ))}
  </div>
);

// --- Componente de Contenido ---
function PageContent() {
  const firestore = useFirestore();
  const router = useRouter();
  const { setEvents } = useContext(EventContext);
  
  // --- Estados de Datos ---
  const [combinedEvents, setCombinedEvents] = useState<CombinedEvent[]>([]);
  
  const eventsQuery = useMemoFirebase(() => query(collection(firestore, "events")), [firestore]);
  const presentationsQuery = useMemoFirebase(() => query(collection(firestore, "presentations")), [firestore]);
  const venuesQuery = useMemoFirebase(() => query(collection(firestore, "venues")), [firestore]);

  const { data: eventsData, isLoading: loadingEvents } = useCollection<Event>(eventsQuery);
  const { data: presentationsData, isLoading: loadingPresentations } = useCollection<Presentation>(presentationsQuery);
  const { data: venuesData, isLoading: loadingVenues } = useCollection<Venue>(venuesQuery);

  const isLoading = loadingEvents || loadingPresentations || loadingVenues;

  const handleCategorySelect = (category: string) => {
    if (category === "Todos") {
        router.push('/events');
    } else {
        router.push(`/events?category=${encodeURIComponent(category)}`);
    }
  };

  useEffect(() => {
    if (isLoading || !eventsData || !presentationsData || !venuesData) {
        return;
    }

    const eventMap = new Map(eventsData.map(e => [e.id, e]));
    const venueMap = new Map(venuesData.map(v => [v.id, v]));

    const upcomingPresentations = presentationsData
        .filter(p => p.eventDate && p.eventDate.toDate() >= new Date())
        .sort((a, b) => a.eventDate.toMillis() - b.eventDate.toMillis());

    const uniqueEvents = new Map<string, CombinedEvent>();

    upcomingPresentations.forEach(p => {
        if (!uniqueEvents.has(p.eventId)) {
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
                    date: p.eventDate.toDate().toLocaleDateString('es-NI', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    }),
                });
            }
        }
    });

    const combinedData = Array.from(uniqueEvents.values());
    setCombinedEvents(combinedData);
    setEvents(combinedData);
    
  }, [eventsData, presentationsData, venuesData, isLoading, setEvents]);

  
  const heroEvents = combinedEvents.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-medium text-foreground">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <HeroCarousel events={heroEvents} />
        
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground text-center mb-6">Explora por Categoría</h2>
          <CategorySelector selected="" onSelect={handleCategorySelect} />
        </section>
        
        <div className="text-center my-12">
            <Button size="lg" asChild>
                <Link href="/events">Ver Todos los Eventos</Link>
            </Button>
        </div>
        
        <div className="mt-16">
            <AboutSection />
        </div>

        <div className="mt-16">
            <WhyUsSection />
        </div>

        <div className="mt-16">
          <SponsorCarousel />
        </div>

      </div>
    </main>
  );
}


// --- Componente Principal de la Página con Suspense ---
export default function MainPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <PageContent />
        </Suspense>
    )
}
