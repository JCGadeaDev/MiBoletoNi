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
        <section className="relative w-full mb-12 md:mb-24 px-1 md:px-0">
            <Carousel
                setApi={setApi}
                plugins={[Autoplay({ delay: 6000 })]}
                opts={{ loop: true }}
                className="w-full rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white dark:border-gray-900"
            >
                <CarouselContent>
                    {events.map((event, index) => (
                        <CarouselItem key={event.id}>
                            {/* CONTENEDOR DE IMAGEN CORREGIDO:
                                Usamos un div con fondo negro y un efecto de "blur background" 
                                para que en escritorio no se pierda información importante.
                            */}
                            <div className="relative aspect-square sm:aspect-[16/9] md:aspect-[21/9] w-full group bg-black overflow-hidden">
                                
                                {/* 1. IMAGEN DE FONDO (BLUR): Para rellenar los laterales en pantallas anchas */}
                                <div className="absolute inset-0 z-0">
                                    <Image
                                        src={event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/800`}
                                        alt="blur background"
                                        fill
                                        className="object-cover blur-3xl opacity-40 scale-125"
                                        unoptimized
                                    />
                                </div>

                                {/* 2. IMAGEN PRINCIPAL (CONTAIN): No se corta nunca */}
                                <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
                                    <Image
                                        src={event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/800`}
                                        alt={event.name}
                                        fill
                                        // Mobile usa 'cover' porque las fotos suelen ser cuadradas/horizontales, PC usa 'contain' para no cortar caras
                                        className="object-cover md:object-contain transition-transform duration-[10s] ease-in-out group-hover:scale-105"
                                        priority={index < 1}
                                        unoptimized
                                    />
                                </div>
                                
                                {/* 3. OVERLAY GRADIENTE (Mejora la legibilidad del texto) */}
                                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/30 to-transparent md:from-black/70" />

                                {/* 4. CONTENIDO DEL SLIDE */}
                                <div className="absolute inset-0 z-30 flex flex-col justify-end p-6 pb-14 md:p-16 text-left max-w-7xl mx-auto w-full">
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
                                        
                                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl line-clamp-2">
                                            {event.name}
                                        </h1>
                                        
                                        <div className="flex flex-wrap gap-2 md:gap-4 text-gray-100 text-xs md:text-lg font-medium">
                                            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                                <span className="truncate max-w-[150px] md:max-w-none">{event.venue}, {event.city}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                                <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                                <span>{event.date}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 md:pt-4">
                                            <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-10 h-14 md:h-16 text-lg font-bold shadow-2xl bg-primary hover:bg-primary/90 text-white hover:scale-105 transition-transform border-b-4 border-primary-dark">
                                                <Link href={`/events/${event.id}`}>
                                                    Comprar Boletos <ArrowRight className="ml-2 w-6 h-6" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                
                {/* Navegación Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-40 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                    {events.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => api?.scrollTo(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${current === index ? 'w-8 bg-primary shadow-lg shadow-primary/50' : 'w-2 bg-white/40 hover:bg-white/70'}`}
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
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(category.name)}
                className="group cursor-pointer relative overflow-hidden rounded-3xl shadow-lg border border-muted/50 bg-card hover:shadow-2xl transition-all duration-300"
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative p-5 md:p-8 flex flex-col items-center text-center gap-4 min-h-[140px] md:min-h-[160px] justify-center">
                    <div className="p-4 rounded-2xl bg-background/80 shadow-md group-hover:bg-white/20 group-hover:text-white transition-all group-hover:rotate-6">
                        <category.icon className="w-7 h-7 md:w-9 md:h-9 text-primary group-hover:text-white" />
                    </div>
                    <h3 className="font-extrabold text-xs md:text-sm group-hover:text-white transition-colors line-clamp-2 leading-tight uppercase tracking-tight">
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
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-lg font-medium text-muted-foreground animate-pulse">Cargando experiencias...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen relative overflow-hidden flex flex-col">
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-background">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 flex-1">
                <HeroCarousel events={heroEvents} />
                
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 md:mb-24"
                >
                    <div className="text-center mb-8 md:mb-16 max-w-3xl mx-auto">
                        <h2 className="font-headline text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-6 tracking-tight">
                            Explora tu Pasión
                        </h2>
                        <p className="text-muted-foreground text-lg md:text-xl font-medium px-4">
                            Encuentra los eventos que te mueven en Nicaragua, desde conciertos inolvidables hasta ferias locales.
                        </p>
                    </div>
                    
                    <CategorySelector onSelect={handleCategorySelect} />
                </motion.section>
                
                <div className="text-center mb-24 md:mb-36">
                    <Button size="lg" asChild className="rounded-full px-12 h-16 md:h-20 text-xl font-black shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 transition-all">
                        <Link href="/events">Descubrir Más <ArrowRight className="ml-3 w-7 h-7" /></Link>
                    </Button>
                </div>
                
                <div className="space-y-24 md:space-y-40 mb-20">
                    <AboutSection />
                    <WhyUsSection />
                    <SponsorCarousel />
                </div>
            </div>
        </main>
    );
}

export default function MainPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <PageContent />
        </Suspense>
    )
}