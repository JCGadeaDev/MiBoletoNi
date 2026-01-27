'use client';

import Image from 'next/image';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Ticket, LockKeyhole, ArrowRight, Loader2, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { doc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { Event, Presentation, PricingTier, Seat, Venue, WithId } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

type PriceInfo = {
    minPrice: number;
    maxPrice: number;
    currency: string;
} | null;

// --- COMPONENTE: TARJETA DE SELECCIÓN DE TICKETS ---
function TicketSelectionCard({ 
    event, 
    presentations, 
    venues, 
    priceInfo,
    isLoadingPrice 
}: { 
    event: WithId<Event>, 
    presentations: WithId<Presentation>[] | null, 
    venues: WithId<Venue>[] | null,
    priceInfo: PriceInfo,
    isLoadingPrice: boolean
}) {
    const router = useRouter();
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    
    const availablePresentations = useMemo(() => 
        presentations?.filter(p => p.status === 'A la venta').sort((a,b) => a.eventDate.toMillis() - b.eventDate.toMillis()) || [], 
    [presentations]);

    const [selectedPresentationId, setSelectedPresentationId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!selectedPresentationId && availablePresentations.length > 0) {
            setSelectedPresentationId(availablePresentations[0].id);
        }
    }, [availablePresentations, selectedPresentationId]);
    
    const selectedPresentation = useMemo(() => {
        if (!selectedPresentationId) return null;
        return presentations?.find(p => p.id === selectedPresentationId);
    }, [selectedPresentationId, presentations]);

    const selectedVenue = useMemo(() => {
        if (!selectedPresentation) return null;
        return venues?.find(v => v.id === selectedPresentation.venueId);
    }, [selectedPresentation, venues]);

    const handlePurchase = () => {
        if (!selectedPresentationId) {
          toast({ variant: 'destructive', title: 'Selección Incompleta', description: 'Por favor, elige una presentación.'});
          return;
        };
        router.push(`/checkout?presentationId=${selectedPresentationId}`);
    };
    
    const priceDisplay = useMemo(() => {
        if (priceInfo) {
            if (priceInfo.minPrice === priceInfo.maxPrice) {
                return `${priceInfo.minPrice.toFixed(2)} ${priceInfo.currency}`;
            }
            return `Desde ${priceInfo.minPrice.toFixed(2)} ${priceInfo.currency}`;
        }
        return "Precios no disponibles";
    }, [priceInfo]);

    return (
        <Card className="shadow-2xl sticky top-24 self-start border-none rounded-[2.5rem] overflow-hidden bg-white">
            <div className="h-2 bg-primary w-full" />
            
            <CardHeader className="pb-4">
              <CardTitle className="font-black text-2xl tracking-tight">Compra tus Boletos</CardTitle>
              <CardDescription>Reserva tu lugar ahora.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                  <div>
                      <label className="font-bold text-xs text-muted-foreground uppercase mb-2 block ml-1">Fecha y Lugar</label>
                      <Select 
                          value={selectedPresentationId || ''} 
                          onValueChange={setSelectedPresentationId}
                          disabled={availablePresentations.length === 0}
                      >
                          <SelectTrigger className="rounded-2xl h-12 border-muted bg-muted/30 focus:ring-primary">
                            <SelectValue placeholder={availablePresentations.length > 0 ? "Selecciona una fecha" : "No hay fechas disponibles"} />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                              {availablePresentations.map(p => (
                                <SelectItem key={p.id} value={p.id} className="rounded-xl">
                                    {p.eventDate?.toDate().toLocaleDateString('es-NI', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  {selectedVenue && (
                      <div className="flex items-start text-sm bg-primary/5 p-4 rounded-[1.5rem] border border-primary/10">
                          <MapPin className="h-5 w-5 mr-3 text-primary shrink-0" />
                          <div>
                            <p className="font-black text-gray-900 leading-none mb-1">{selectedVenue.name}</p>
                            <p className="text-muted-foreground text-xs">{selectedVenue.city}, Nicaragua</p>
                          </div>
                      </div>
                  )}
              </div>

              <div className="pt-2">
                <div className="mb-6 bg-muted/20 p-4 rounded-[1.5rem] border border-dashed text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Precios oficiales</p>
                    {isLoadingPrice ? (
                        <Skeleton className="h-8 w-24 mx-auto rounded-lg"/>
                    ) : (
                        <p className={`font-black text-3xl tracking-tighter ${priceInfo ? 'text-primary' : 'text-muted-foreground text-xl'}`}>
                            {priceDisplay}
                        </p>
                    )}
                </div>

                {isUserLoading ? (
                    <Button disabled className="w-full h-14 rounded-full">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Validando...
                    </Button>
                ) : !user ? (
                    <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 items-start shadow-sm">
                            <LockKeyhole className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-amber-900 font-medium leading-tight text-balance">
                                Para garantizar una compra segura, debes <strong>iniciar sesión</strong> antes de continuar.
                            </p>
                        </div>
                        <Button asChild className="w-full h-16 text-lg font-black rounded-full shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform uppercase tracking-tight">
                            <Link href={`/auth/login?redirect=/events/${event.id}`}>
                                Iniciar Sesión <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <Button 
                      size="lg" 
                      className="w-full h-16 text-lg font-black rounded-full shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform uppercase tracking-tight" 
                      onClick={handlePurchase}
                      disabled={!selectedPresentation || selectedPresentation.status !== 'A la venta'}
                    >
                      <Ticket className="mr-2 h-6 w-6" />
                      {selectedPresentation?.status === 'A la venta' ? 'Elegir Asientos' : 'No disponible'}
                    </Button>
                )}
              </div>
            </CardContent>
        </Card>
    );
}

// --- COMPONENTE PRINCIPAL ---
export default function EventPage() {
  const firestore = useFirestore();
  const params = useParams();
  const eventId = params.id as string;
  const { toast } = useToast();
  
  const [priceInfo, setPriceInfo] = useState<PriceInfo>(null);
  const [isPriceLoading, setIsPriceLoading] = useState(true);

  const eventRef = useMemoFirebase(() => firestore ? doc(firestore, 'events', eventId) : null, [firestore, eventId]);
  const { data: event, isLoading: eventLoading } = useDoc<Event>(eventRef);

  const presentationsQuery = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return query(collection(firestore, "presentations"), where("eventId", "==", eventId));
  }, [firestore, eventId]);
  
  const { data: presentations, isLoading: presentationsLoading } = useCollection<Presentation>(presentationsQuery);
  
  const venueIds = useMemo(() => presentations ? [...new Set(presentations.map(p => p.venueId))] : [], [presentations]);
  const [venues, setVenues] = useState<WithId<Venue>[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  
  useEffect(() => {
    if (!firestore || venueIds.length === 0) { setVenuesLoading(false); return; }
    const fetchVenues = async () => {
        try {
            const venuesQuery = query(collection(firestore, 'venues'), where('__name__', 'in', venueIds));
            const venueDocs = await getDocs(venuesQuery);
            setVenues(venueDocs.docs.map(d => ({id: d.id, ...d.data()}) as WithId<Venue>));
        } catch (e) { console.error(e); } finally { setVenuesLoading(false); }
    }
    fetchVenues();
  }, [venueIds, firestore]);

  useEffect(() => {
    const fetchPriceInfo = async () => {
        if (!presentations || !venues || !firestore) { setIsPriceLoading(false); return; }
        setIsPriceLoading(true);
        const first = presentations.filter(p => p.status === 'A la venta').sort((a,b) => a.eventDate.toMillis() - b.eventDate.toMillis())[0];
        if (!first) { setIsPriceLoading(false); return; }
        
        try {
            const venue = venues.find(v => v.id === first.venueId);
            const subCol = venue?.type === 'general' ? 'pricingtiers' : 'seats';
            const snap = await getDocs(query(collection(firestore, `presentations/${first.id}/${subCol}`), limit(50)));
            if (!snap.empty) {
                const prices = snap.docs.map(d => d.data().price);
                setPriceInfo({ minPrice: Math.min(...prices), maxPrice: Math.max(...prices), currency: snap.docs[0].data().currency || 'NIO' });
            }
        } catch (e) { console.error(e); } finally { setIsPriceLoading(false); }
    };
    fetchPriceInfo();
  }, [presentations, venues, firestore]);

  // Lógica para el Script de Google (SEO)
  const jsonLd = useMemo(() => {
    if (!event || !presentations?.[0]) return null;
    const firstP = presentations[0];
    const venue = venues.find(v => v.id === firstP.venueId);
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.name,
      description: event.description,
      image: event.imageUrl,
      startDate: firstP.eventDate?.toDate().toISOString(),
      location: {
        '@type': 'Place',
        name: venue?.name,
        address: {
          '@type': 'PostalAddress',
          addressLocality: venue?.city,
          addressCountry: 'NI',
        },
      },
      offers: {
        '@type': 'Offer',
        price: priceInfo?.minPrice,
        priceCurrency: priceInfo?.currency || 'NIO',
        availability: 'https://schema.org/InStock',
        url: `https://miboletoni.com/events/${eventId}`
      }
    };
  }, [event, presentations, venues, priceInfo, eventId]);

  if (eventLoading || presentationsLoading || venuesLoading) return <div className="container py-20 text-center"><Loader2 className="animate-spin mx-auto h-12 w-12 text-primary" /></div>;
  if (!event) notFound();

  const imageUrl = event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/800`;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 md:py-16">
      {/* Script para Google Search Console SEO */}
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}

      <div className="grid lg:grid-cols-3 gap-8 md:gap-16">
        
        <div className="lg:col-span-2">
          {/* HEADER VISUAL: Altura de 600px en Desktop para impacto total */}
          <div className="relative aspect-[4/3] md:aspect-[16/10] lg:h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl mb-10 bg-black border-4 border-white">
            <Image src={imageUrl} alt="blur" fill className="object-cover blur-3xl opacity-40 scale-110" unoptimized />
            <Image src={imageUrl} alt={event.name} fill className="object-contain p-4" priority unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                 <span className="bg-primary/10 text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-primary/20">
                    {event.category}
                 </span>
                 <span className="bg-green-500/10 text-green-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-green-500/20">
                    Evento Verificado
                 </span>
              </div>
              <h1 className="font-black text-4xl md:text-7xl text-gray-900 tracking-tighter leading-none">{event.name}</h1>
          </div>

          <Separator className="my-10" />

          {/* DESCRIPCIÓN ULTRA RESALTADA PARA CONVERSIÓN */}
          <div className="relative group mb-12">
             <div className="flex items-center gap-3 mb-8 text-primary">
                <Sparkles className="h-8 w-8 animate-pulse" />
                <h3 className="font-black text-2xl md:text-3xl uppercase tracking-tighter text-gray-900">Sobre la Experiencia</h3>
             </div>
             <div className="bg-gradient-to-br from-white to-primary/[0.04] p-8 md:p-14 rounded-[3.5rem] border border-primary/10 shadow-2xl relative overflow-hidden">
                {/* Comilla decorativa gigante de fondo */}
                <span className="absolute -top-10 -right-4 text-[15rem] font-black text-primary/5 select-none pointer-events-none">"</span>
                
                <p className="text-xl md:text-4xl font-bold text-gray-800 leading-[1.1] tracking-tighter whitespace-pre-wrap relative z-10 italic">
                    {event.description || 'Prepárate para vivir una noche mágica e inolvidable. ¡Asegura tu lugar ahora!'}
                </p>
             </div>
          </div>
          
          {/* MAPA */}
          {venues.find(v => v.id === presentations?.[0]?.venueId)?.seatMapImageUrl && (
            <div className="mt-20">
                <h3 className="font-black text-2xl mb-6 flex items-center gap-2">
                   <MapPin className="text-primary" /> Ubicaciones y Mapa
                </h3>
                <div className="relative aspect-video w-full rounded-[3rem] overflow-hidden border-2 border-muted bg-white shadow-xl group cursor-zoom-in">
                    <Image 
                      src={venues.find(v => v.id === presentations?.[0]?.venueId)!.seatMapImageUrl!} 
                      alt="Mapa" fill className="object-contain p-8 transition-transform duration-500 group-hover:scale-105" unoptimized 
                    />
                </div>
            </div>
          )}
        </div>

        <aside className="lg:col-span-1">
          <TicketSelectionCard 
            event={{...event, id: eventId}} 
            presentations={presentations} 
            venues={venues}
            priceInfo={priceInfo}
            isLoadingPrice={isPriceLoading}
          />
        </aside>
      </div>
    </div>
  );
}