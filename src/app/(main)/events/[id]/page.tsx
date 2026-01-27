'use client';
import Image from 'next/image';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Ticket, LockKeyhole, ArrowRight, Loader2 } from 'lucide-react'; // Añadidos iconos
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase'; // Añadido useUser
import { doc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { Event, Presentation, PricingTier, Seat, Venue, WithId } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type PriceInfo = {
    minPrice: number;
    maxPrice: number;
    currency: string;
} | null;

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
    const { user, isUserLoading } = useUser(); // Obtenemos el estado del usuario
    
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
        <Card className="shadow-lg sticky top-24 self-start border-primary/10 overflow-hidden">
            {/* Línea decorativa superior */}
            <div className="h-1.5 bg-primary w-full" />
            
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Compra tus Boletos</CardTitle>
              <CardDescription>Reserva tu lugar en este evento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                  <div>
                      <label className="font-semibold text-sm text-foreground mb-1.5 block">1. Elige la Presentación</label>
                      <Select 
                          value={selectedPresentationId || ''} 
                          onValueChange={setSelectedPresentationId}
                          disabled={availablePresentations.length === 0}
                      >
                          <SelectTrigger className="rounded-xl border-primary/20 bg-muted/30">
                            <SelectValue placeholder={availablePresentations.length > 0 ? "Selecciona una fecha" : "No hay fechas disponibles"} />
                          </SelectTrigger>
                          <SelectContent>
                              {availablePresentations.map(p => {
                                const venue = venues?.find(v => v.id === p.venueId);
                                return (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.eventDate?.toDate().toLocaleDateString('es-NI', { weekday: 'short', month: 'short', day: 'numeric' })} - {venue?.name}
                                    </SelectItem>
                                )
                              })}
                          </SelectContent>
                      </Select>
                  </div>
                  {selectedVenue && (
                      <div className="flex items-start text-sm bg-primary/5 p-3 rounded-xl border border-primary/10">
                          <MapPin className="h-4 w-4 mr-3 mt-0.5 text-primary" />
                          <div>
                            <p className="font-bold text-gray-800">{selectedVenue.name}</p>
                            <p className="text-muted-foreground text-xs">{selectedVenue.city}, Nicaragua</p>
                          </div>
                      </div>
                  )}
              </div>

              <Separator />
              
              <div className="pt-2">
                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Precios Disponibles</p>
                    {isLoadingPrice ? (
                        <Skeleton className="h-10 w-2/3 rounded-lg"/>
                    ) : (
                        <p className={`font-black text-3xl tracking-tight ${priceInfo ? 'text-primary' : 'text-muted-foreground text-xl'}`}>
                            {priceDisplay}
                        </p>
                    )}
                </div>

                {/* --- LÓGICA DE BOTÓN DINÁMICO --- */}
                {isUserLoading ? (
                    <Button disabled className="w-full h-12 rounded-full">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Validando sesión...
                    </Button>
                ) : !user ? (
                    /* CASO: USUARIO NO LOGUEADO */
                    <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 items-start">
                            <LockKeyhole className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                Para garantizar una compra segura, debes <strong>iniciar sesión</strong> antes de elegir tus asientos.
                            </p>
                        </div>
                        <Button asChild className="w-full h-14 text-lg font-bold rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                            <Link href={`/auth?redirect=/events/${event.id}`}>
                                Iniciar Sesión <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                ) : (
                    /* CASO: USUARIO LOGUEADO */
                    <Button 
                      size="lg" 
                      className="w-full h-14 text-lg font-bold rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform" 
                      onClick={handlePurchase}
                      disabled={!selectedPresentation || selectedPresentation.status !== 'A la venta'}
                    >
                      <Ticket className="mr-2 h-5 w-5" />
                      {selectedPresentation?.status === 'A la venta' ? 'Comprar Boletos' : selectedPresentation?.status || 'No disponible'}
                    </Button>
                )}

                <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    <span className="w-8 h-[1px] bg-muted" />
                    🔒 Transacción Protegida
                    <span className="w-8 h-[1px] bg-muted" />
                </div>
              </div>

            </CardContent>
        </Card>
    );
}

export default function EventPage() {
  const firestore = useFirestore();
  const params = useParams();
  const eventId = params.id as string;
  const { toast } = useToast();
  
  const [priceInfo, setPriceInfo] = useState<PriceInfo>(null);
  const [isPriceLoading, setIsPriceLoading] = useState(true);

  const eventRef = useMemoFirebase(() => firestore ? doc(firestore, 'events', eventId) : null, [firestore, eventId]);
  const { data: event, isLoading: eventLoading, error: eventError } = useDoc<Event>(eventRef);

  const presentationsQuery = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return query(collection(firestore, "presentations"), where("eventId", "==", eventId));
  }, [firestore, eventId]);
  
  const { data: presentations, isLoading: presentationsLoading, error: presentationsError } = useCollection<Presentation>(presentationsQuery);
  
  const venueIds = useMemo(() => {
    if (!presentations) return [];
    return [...new Set(presentations.map(p => p.venueId))];
  }, [presentations]);
  
  const [venues, setVenues] = useState<WithId<Venue>[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  
  useEffect(() => {
    if (!firestore || venueIds.length === 0) {
      setVenuesLoading(false);
      return;
    };
    setVenuesLoading(true);
    const fetchVenues = async () => {
        try {
            if (venueIds.length > 0) {
                const venuesQuery = query(collection(firestore, 'venues'), where('__name__', 'in', venueIds));
                const venueDocs = await getDocs(venuesQuery);
                const venuesData = venueDocs.docs.map(d => ({id: d.id, ...d.data()}) as WithId<Venue>);
                setVenues(venuesData);
            } else {
                setVenues([]);
            }
        } catch (error) {
            console.error("Error fetching venues:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los detalles de los recintos.'})
        } finally {
            setVenuesLoading(false);
        }
    }
    fetchVenues();
  }, [venueIds, firestore, toast]);

  useEffect(() => {
    const fetchPriceInfo = async () => {
        if (!presentations || !venues || presentations.length === 0 || venues.length === 0 || !firestore) {
            setIsPriceLoading(false);
            return;
        }

        setIsPriceLoading(true);

        const firstAvailablePresentation = presentations
            .filter(p => p.status === 'A la venta')
            .sort((a,b) => a.eventDate.toMillis() - b.eventDate.toMillis())[0];

        if (!firstAvailablePresentation) {
            setPriceInfo(null);
            setIsPriceLoading(false);
            return;
        }

        const venue = venues.find(v => v.id === firstAvailablePresentation.venueId);
        if (!venue) {
            setPriceInfo(null);
            setIsPriceLoading(false);
            return;
        }
        
        let prices: number[] = [];
        let currency = 'NIO';

        try {
            if (venue.type === 'general') {
                const tiersQuery = query(collection(firestore, `presentations/${firstAvailablePresentation.id}/pricingtiers`), limit(50));
                const tiersSnap = await getDocs(tiersQuery);
                if (!tiersSnap.empty) {
                    const tiers = tiersSnap.docs.map(d => d.data() as PricingTier);
                    prices = tiers.map(t => t.price);
                    currency = tiers[0].currency;
                }
            } else if (venue.type === 'numbered') {
                const seatsQuery = query(collection(firestore, `presentations/${firstAvailablePresentation.id}/seats`), where('status', '==', 'available'), limit(50));
                const seatsSnap = await getDocs(seatsQuery);
                if (!seatsSnap.empty) {
                    const seats = seatsSnap.docs.map(d => d.data() as Seat);
                    prices = seats.map(s => s.price);
                    currency = seats[0].currency;
                }
            }

            if (prices.length > 0) {
                setPriceInfo({
                    minPrice: Math.min(...prices),
                    maxPrice: Math.max(...prices),
                    currency,
                });
            } else {
                setPriceInfo(null);
            }
        } catch (error) {
            console.error("Error fetching price info:", error);
            setPriceInfo(null);
        } finally {
            setIsPriceLoading(false);
        }
    };

    fetchPriceInfo();
}, [presentations, venues, firestore]);

  const isLoading = eventLoading || presentationsLoading || venuesLoading;
  const queryError = eventError || presentationsError;

  const selectedPresentation = useMemo(() => {
    if (!presentations) return null;
    const available = presentations.filter(p => p.status === 'A la venta').sort((a,b) => a.eventDate.toMillis() - b.eventDate.toMillis());
    return available.length > 0 ? available[0] : null;
  }, [presentations]);

  const selectedVenue = useMemo(() => {
      if (!selectedPresentation || !venues) return null;
      return venues.find(v => v.id === selectedPresentation.venueId) || null;
  }, [selectedPresentation, venues]);

  if (isLoading) {
    return (
        <div className="container py-12">
            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <Skeleton className="aspect-[16/9] w-full rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                    </div>
                     <Separator />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-3/4" />
                    </div>
                </div>
                <aside className="lg:col-span-1 space-y-8 sticky top-24 self-start">
                     <Skeleton className="h-[700px] w-full" />
                </aside>
            </div>
        </div>
    );
  }

  if (queryError) {
      return (
          <div className="container py-12">
              <Card>
                  <CardHeader><CardTitle>Ocurrió un Error</CardTitle></CardHeader>
                  <CardContent><p className="text-destructive">No se pudieron cargar los detalles del evento.</p></CardContent>
              </Card>
          </div>
      )
  }

  if (!event) {
    notFound();
  }

  const imageUrl = event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/800`;

  return (
    <div className="container py-12">
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden shadow-lg mb-8 border">
            <Image
              src={imageUrl}
              alt={event.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 67vw"
              priority
              unoptimized
            />
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            {event.name}
          </h1>
          <div className="flex gap-2 mt-3">
             <Badge variant="secondary" className="px-3 py-1 rounded-full uppercase tracking-wider text-[10px]">{event.category}</Badge>
             <Badge variant="outline" className="px-3 py-1 rounded-full text-[10px]">VERIFICADO</Badge>
          </div>

          <Separator className="my-8" />

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h3 className="font-headline text-2xl font-bold flex items-center gap-2">
               <Calendar className="h-6 w-6 text-primary" /> Acerca de este Evento
            </h3>
            <p className="text-muted-foreground leading-relaxed mt-4 whitespace-pre-wrap">{event.description || 'No hay descripción disponible para este evento.'}</p>
          </div>
          
           {selectedVenue?.seatMapImageUrl && (
            <div className="mt-12">
                <Separator className="my-8" />
                <h3 className="font-headline text-2xl font-bold mb-4">Mapa del Recinto</h3>
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border shadow-inner bg-muted/20">
                    <Image 
                        src={selectedVenue.seatMapImageUrl}
                        alt={`Mapa de ${selectedVenue.name}`}
                        fill
                        className="object-contain p-4"
                        unoptimized
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