'use client';

import React, { useEffect, useState, Suspense, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// --- Importaciones de Iconos ---
import { MapPin, CalendarDays, ArrowRight, Music, Trophy, Theater, Store, LayoutGrid, Ticket, Loader2 } from 'lucide-react';

// --- Importaciones de Firebase y Hooks ---
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

// --- Importaciones de Componentes de UI ---
import { Button } from '@/components/ui/button';
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
import type { Event, Presentation, Venue, CombinedEvent } from '@/lib/types';

// --- COMPONENTE: HERO CAROUSEL OPTIMIZADO ---
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
        <section className="relative w-full mb-12 md:mb-24">
            <Carousel
                setApi={setApi}
                plugins={[Autoplay({ delay: 6000 })]}
                opts={{ loop: true }}
                className="w-full rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-2 md:border-4 border-white dark:border-gray-800"
            >
                <CarouselContent>
                    {events.map((event, index) => (
                        <CarouselItem key={event.id}>
                            {/* AJUSTE RESPONSIVE CRÍTICO:
                                - Mobile: aspect-square (Cuadrado 1:1) para ver bien la imagen sin ocupar toda la altura.
                                - Tablet: aspect-[16/9]
                                - Desktop: aspect-[21/9] (Panorámico)
                            */}
                            <div className="relative aspect-square sm:aspect-[16/9] md:aspect-[21/9] w-full group bg-black">
                                {/* Imagen con efecto Zoom Lento */}
                                <div className="absolute inset-0 overflow-hidden">
                                    <Image
                                        src={event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/800`}
                                        alt={event.name}
                                        fill
                                        className="object-cover transition-transform duration-[10s] ease-in-out group-hover:scale-110 opacity-90"
                                        priority={index < 1}
                                        unoptimized
                                    />
                                </div>
                                
                                {/* Overlay Gradiente Mejorado (Más oscuro abajo para leer texto) */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                                {/* Contenido del Slide */}
                                {/* pb-14 en móvil levanta el texto para no chocar con los dots */}
                                <div className="absolute inset-0 flex flex-col justify-end p-6 pb-14 md:p-16 text-left max-w-7xl mx-auto w-full z-10">
                                    <motion.div 
                                        initial={{ y: 30, opacity: 0 }}
                                        whileInView={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.6 }}
                                        className="space-y-3 md:space-y-6 max-w-4xl"
                                    >
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/90 backdrop-blur-md text-primary-foreground text-[10px] md:text-sm font-bold uppercase tracking-wider w-fit border border-white/10 shadow-lg">
                                            <Ticket className="w-3 h-3 md:w-4 md:h-4" />
                                            Evento Destacado
                                        </div>
                                        
                                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-xl line-clamp-2">
                                            {event.name}
                                        </h1>
                                        
                                        <div className="flex flex-wrap gap-2 md:gap-4 text-gray-100 text-xs md:text-lg font-medium">
                                            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                                <span className="truncate max-w-[150px] md:max-w-none">{event.venue}, {event.city}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                                <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                                <span>{event.date}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 md:pt-4">
                                            <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-8 text-base md:text-lg font-bold shadow-lg bg-primary hover:bg-primary/90 text-white hover:scale-105 transition-transform">
                                                <Link href={`/events/${event.id}`}>
                                                    Boletos <ArrowRight className="ml-2 w-5 h-5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                
                {/* Navegación Dots (Centrada abajo) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    {events.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => api?.scrollTo(index)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${current === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white'}`}
                            aria-label={`Ir a slide ${index + 1}`}
                        />
                    ))}
                </div>
            </Carousel>
        </section>
    );
};

// --- COMPONENTE: CATEGORÍAS ---
const categories = [
    { name: "Todos", icon: LayoutGrid, color: "from-gray-500 to-gray-700" },
    { name: "Conciertos y Festivales", icon: Music, color: "from-purple-500 to-indigo-600" },
    { name: "Teatro", icon: Theater, color: "from-red-500 to-pink-600" },
    { name: "Deportes", icon: Trophy, color: "from-orange-400 to-orange-600" },
    { name: "Expo y Ferias", icon: Store, color: "from-blue-400 to-cyan-600" },
];

const CategorySelector = ({ onSelect }: { onSelect: (category: string) => void }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
        {categories.map((category) => (
            <motion.div
                key={category.name}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(category.name)}
                className="group cursor-pointer relative overflow-hidden rounded-2xl shadow-md border border-muted/50 bg-card hover:shadow-xl transition-all duration-300"
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative p-4 md:p-6 flex flex-col items-center text-center gap-3 min-h-[120px] md:min-h-[140px] justify-center">
                    <div className="p-3 rounded-full bg-background/80 shadow-sm group-hover:bg-white/20 group-hover:text-white transition-colors">
                        <category.icon className="w-6 h-6 md:w-8 md:h-8 text-primary group-hover:text-white" />
                    </div>
                    <h3 className="font-bold text-xs md:text-sm group-hover:text-white transition-colors line-clamp-2 leading-tight">
                        {category.name}
                    </h3>
                </div>
            </motion.div>
        ))}
    </div>
);

// --- COMPONENTE: CONTENIDO PRINCIPAL ---
function PageContent() {
    const firestore = useFirestore();
    const router = useRouter();
    const { setEvents } = useContext(EventContext);

    // --- Estados ---
    const [combinedEvents, setCombinedEvents] = useState<CombinedEvent[]>([]);

    // Hooks de Firebase
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
        if (isLoading || !eventsData || !presentationsData || !venuesData) return;

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
                        rawDate: p.eventDate.toDate()
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
                <p className="text-lg font-medium text-muted-foreground animate-pulse">Cargando experiencias...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen relative overflow-hidden flex flex-col">
            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-background">
                <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 rounded-full blur-[80px] md:blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-500/5 rounded-full blur-[80px] md:blur-[100px]" />
            </div>

            {/* CONTENEDOR CENTRAL: max-w-7xl + mx-auto centra todo el contenido */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 flex-1">
                
                <HeroCarousel events={heroEvents} />
                
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 md:mb-24"
                >
                    <div className="text-center mb-8 md:mb-12 max-w-3xl mx-auto">
                        <h2 className="font-headline text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-4">
                            Explora tu Pasión
                        </h2>
                        <p className="text-muted-foreground text-base md:text-lg">
                            Encuentra los eventos que te mueven, desde música en vivo hasta teatro.
                        </p>
                    </div>
                    
                    {/* Centramos el selector de categorías */}
                    <div className="w-full">
                        <CategorySelector onSelect={handleCategorySelect} />
                    </div>
                </motion.section>
                
                <div className="text-center mb-20 md:mb-32">
                    <Button size="lg" asChild className="rounded-full px-10 py-6 text-base md:text-lg font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                        <Link href="/events">Ver Todos los Eventos</Link>
                    </Button>
                </div>
                
                <div className="space-y-20 md:space-y-32">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                        <AboutSection />
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                        <WhyUsSection />
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                        <SponsorCarousel />
                    </motion.div>
                </div>

            </div>
        </main>
    );
}

// --- Componente Principal ---
export default function MainPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <PageContent />
        </Suspense>
    )
}