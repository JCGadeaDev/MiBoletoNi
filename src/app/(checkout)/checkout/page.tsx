
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { Lock, ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { doc, getDocs, collection, query, where, getDoc, writeBatch, Timestamp } from "firebase/firestore";
import type { Presentation, PricingTier, Event, Venue, WithId, Seat } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// --- Componentes de Selección ---

const GeneralAdmissionSelector = ({ presentation, tiers, onSelectionChange, initialSelection }: {
  presentation: WithId<Presentation> | null,
  tiers: WithId<PricingTier>[],
  onSelectionChange: (selection: { tierId: string, tierName: string, quantity: number, price: number, currency: string } | null) => void,
  initialSelection: any | null
}) => {
  const [selectedTierId, setSelectedTierId] = useState<string | null>(initialSelection?.tierId || null);
  const [quantity, setQuantity] = useState(initialSelection?.quantity || 1);

  useEffect(() => {
    if (!initialSelection && tiers.length > 0) {
      const firstAvailable = tiers.find(t => (t.capacity - t.sold) > 0);
      if (firstAvailable) {
        handleTierChange(firstAvailable.id);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiers, initialSelection]);
  
  const selectedTier = tiers.find(t => t.id === selectedTierId);
  const available = selectedTier ? selectedTier.capacity - selectedTier.sold : 0;

  const handleTierChange = (tierId: string) => {
    const tier = tiers.find(t => t.id === tierId);
    if (!tier) return;

    setSelectedTierId(tier.id);
    const newQuantity = 1;
    setQuantity(newQuantity);
    onSelectionChange({ 
      tierId: tier.id, 
      tierName: tier.name, 
      quantity: newQuantity, 
      price: tier.price, 
      currency: tier.currency 
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (!selectedTier) return;
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > available) newQuantity = available;
    setQuantity(newQuantity);
    onSelectionChange({
      tierId: selectedTier.id,
      tierName: selectedTier.name,
      quantity: newQuantity,
      price: selectedTier.price,
      currency: selectedTier.currency
    });
  };

  return (
    <div className="space-y-4">
      <label className="block text-lg font-semibold text-foreground">Elige tu localidad</label>
      {tiers.map(tier => {
        const isAvailable = (tier.capacity - tier.sold) > 0;
        const isSelected = selectedTierId === tier.id;
        return (
          <label 
            key={tier.id} 
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
              isSelected ? 'border-primary ring-2 ring-primary' : 'border-border'
            } ${!isAvailable ? 'bg-muted/50 cursor-not-allowed opacity-60' : 'hover:border-accent'}`}
          >
            <input
              type="radio"
              name="pricingTier"
              value={tier.id}
              disabled={!isAvailable}
              checked={isSelected}
              onChange={(e) => handleTierChange(e.target.value)}
              className="hidden"
            />
            <div>
              <span className="text-lg font-medium text-foreground">{tier.name}</span>
              {!isAvailable && <span className="text-sm font-bold text-destructive ml-2">(Agotado)</span>}
            </div>
            <span className="text-xl font-bold text-primary">{tier.price.toFixed(2)} {tier.currency}</span>
          </label>
        );
      })}
      
      {selectedTier && available > 0 && presentation?.status === 'A la venta' && (
        <div className="mt-6">
          <label className="block text-lg font-semibold text-foreground mb-3">Cantidad</label>
          <div className="flex items-center gap-4 max-w-xs">
            <Button onClick={() => handleQuantityChange(quantity - 1)} variant="outline" size="icon" className="w-12 h-12 text-2xl">-</Button>
            <span className="text-3xl font-bold text-foreground w-16 text-center">{quantity}</span>
            <Button onClick={() => handleQuantityChange(quantity + 1)} variant="outline" size="icon" className="w-12 h-12 text-2xl">+</Button>
          </div>
        </div>
      )}
    </div>
  );
};

const NumberedSeatSelector = ({ seats, onSelectionChange, initialSelection }: { 
    seats: WithId<Seat>[], 
    onSelectionChange: (selection: { seats: WithId<Seat>[] } | null) => void,
    initialSelection: any | null
}) => {
    const [selectedSeats, setSelectedSeats] = useState<WithId<Seat>[]>(initialSelection?.seats || []);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    const sections = useMemo(() => {
        const sortedSeats = [...seats].sort((a,b) => a.section.localeCompare(b.section));
        return [...new Set(sortedSeats.map(s => s.section))];
    }, [seats]);

    useEffect(() => {
        if (sections.length > 0 && !selectedSection) {
            setSelectedSection(sections[0]);
        }
    }, [sections, selectedSection]);


    const seatsBySection = useMemo(() => {
        return seats
            .filter(seat => seat.section === selectedSection)
            .sort((a, b) => {
                 if (a.row < b.row) return -1;
                 if (a.row > b.row) return 1;
                 return parseInt(a.number, 10) - parseInt(b.number, 10);
            });
    }, [seats, selectedSection]);

    const handleSeatToggle = (seat: WithId<Seat>) => {
        if (seat.status !== 'available') {
            return;
        }

        const newSelectedSeats = selectedSeats.some(s => s.id === seat.id)
            ? selectedSeats.filter(s => s.id !== seat.id)
            : [...selectedSeats, seat];
        
        setSelectedSeats(newSelectedSeats);
        onSelectionChange(newSelectedSeats.length > 0 ? { seats: newSelectedSeats } : null);
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="section-select" className="block text-lg font-semibold text-foreground mb-2">Elige la Sección</label>
                <Select value={selectedSection || ''} onValueChange={setSelectedSection}>
                    <SelectTrigger id="section-select">
                        <SelectValue placeholder="Selecciona una sección" />
                    </SelectTrigger>
                    <SelectContent>
                        {sections.map(section => (
                            <SelectItem key={section} value={section}>{section}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedSection && (
                 <div>
                    <label className="block text-lg font-semibold text-foreground mt-6 mb-3">Elige tus Asientos</label>
                    <ScrollArea className="h-64 w-full rounded-md border p-4">
                        <div className="flex flex-wrap gap-2">
                             {seatsBySection.length > 0 ? seatsBySection.map(seat => {
                                const isSelected = selectedSeats.some(s => s.id === seat.id);
                                const isReserved = seat.status === 'reserved';
                                const isSold = seat.status === 'sold';
                                
                                return (
                                    <Button
                                        key={seat.id}
                                        variant={isSelected ? 'default' : isSold ? 'destructive' : 'outline'}
                                        size="sm"
                                        onClick={() => handleSeatToggle(seat)}
                                        disabled={isSold || isReserved}
                                        className={cn("w-20", 
                                            isSelected && "ring-2 ring-primary-foreground",
                                            isSold && "bg-muted text-muted-foreground cursor-not-allowed",
                                            isReserved && "bg-amber-500/80 text-white cursor-not-allowed"
                                        )}
                                    >
                                        {seat.row}{seat.number}
                                    </Button>
                                )
                            }) : <p className="text-muted-foreground text-sm">No hay asientos disponibles en esta sección.</p>}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
};


// --- Order Summary Component ---
function OrderSummary({ presentation, eventData, venue, selection, isLoading, onContinue }: {
    presentation: WithId<Presentation> | null,
    eventData: WithId<Event> | null,
    venue: WithId<Venue> | null,
    selection: any,
    isLoading: boolean,
    onContinue: () => void;
}) {
    const summary = useMemo(() => {
        if (!selection || !venue) return { items: [], totalPrice: 0, currency: 'NIO', count: 0 };

        if (venue.type === 'general' && selection.quantity > 0) {
            return {
                items: [{ name: `${selection.quantity} x ${selection.tierName}`, price: selection.price * selection.quantity }],
                totalPrice: selection.price * selection.quantity,
                currency: selection.currency,
                count: selection.quantity
            };
        }
        
        if (venue.type === 'numbered' && selection.seats && selection.seats.length > 0) {
            const totalPrice = selection.seats.reduce((acc: number, seat: Seat) => acc + seat.price, 0);
            return {
                items: selection.seats.map((s: Seat) => ({ name: `Asiento ${s.row}${s.number}`, price: s.price })),
                totalPrice,
                currency: selection.seats[0].currency,
                count: selection.seats.length
            };
        }
        
        return { items: [], totalPrice: 0, currency: 'NIO', count: 0 };
    }, [selection, venue]);

    if (isLoading || !presentation || !eventData || !venue) {
        return (
            <Card className="sticky top-24">
                <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-5 w-1/4" /></div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-8 w-1/2" /></div>
                    <Skeleton className="h-12 w-full mt-4" />
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="font-headline">Resumen del Pedido</CardTitle>
                <CardDescription>Estás comprando boletos para <span className="font-semibold text-primary">{eventData.name}</span></CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {summary.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                            <span className="text-muted-foreground">{item.name}</span>
                            <span>{summary.currency} {item.price.toFixed(2)}</span>
                        </div>
                    ))}
                     <div className="text-sm text-muted-foreground">
                        <p>{venue.name}, {venue.city}</p>
                        <p>{presentation.eventDate.toDate().toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>

                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total a Pagar</span>
                        <span>{summary.currency} {summary.totalPrice.toFixed(2)}</span>
                    </div>

                    <Button size="lg" className="w-full mt-4" disabled={summary.count === 0 || isLoading} onClick={onContinue}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Continuar
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function CheckoutPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const firestore = useFirestore();

    const [selection, setSelection] = useState<any>(null);
    const [isReserving, setIsReserving] = useState(false);

    // --- Params ---
    const presentationId = searchParams.get('presentationId');

    // --- Data Fetching ---
    const presentationRef = useMemoFirebase(() => firestore && presentationId ? doc(firestore, 'presentations', presentationId) : null, [firestore, presentationId]);
    const { data: presentation, isLoading: presentationLoading } = useDoc<Presentation>(presentationRef);

    const eventId = presentation?.eventId;
    const venueId = presentation?.venueId;

    const eventRef = useMemoFirebase(() => firestore && eventId ? doc(firestore, 'events', eventId) : null, [firestore, eventId]);
    const { data: eventData, isLoading: eventLoading } = useDoc<Event>(eventRef);

    const venueRef = useMemoFirebase(() => firestore && venueId ? doc(firestore, 'venues', venueId) : null, [firestore, venueId]);
    const { data: venue, isLoading: venueLoading } = useDoc<Venue>(venueRef);
    
    // Data for selectors
    const pricingTiersQuery = useMemoFirebase(() => {
        if (!firestore || !presentationId || venue?.type !== 'general') return null;
        return query(collection(firestore, 'presentations', presentationId, 'pricingtiers'));
    }, [firestore, presentationId, venue]);
    const { data: tiers, isLoading: tiersLoading } = useCollection<PricingTier>(pricingTiersQuery);

    const seatsQuery = useMemoFirebase(() => {
      if (!firestore || !presentationId || venue?.type !== 'numbered') return null;
      return query(collection(firestore, 'presentations', presentationId, 'seats'));
    }, [firestore, presentationId, venue]);
    const { data: seatsData, isLoading: seatsLoading } = useCollection<Seat>(seatsQuery as any);

    useEffect(() => {
        if (!isUserLoading && !user) {
             const fullRedirectPath = `/checkout?${searchParams.toString()}`;
             router.replace(`/auth?redirect=${encodeURIComponent(fullRedirectPath)}`);
        }
        if (!presentationId) {
             toast({ variant: "destructive", title: "Faltan datos", description: "La información de la compra es incompleta." });
             router.push(eventId ? `/events/${eventId}` : '/');
        }
    }, [presentationId, eventId, toast, router, user, isUserLoading, searchParams]);

    const handleContinueToPayment = async () => {
        if (!firestore || !user || !presentation || !venue || !selection) return;

        setIsReserving(true);

        // For general admission, no reservation logic is needed, just proceed.
        if (venue.type === 'general') {
             let params = new URLSearchParams();
             params.set('presentationId', presentation.id);
             params.set('tierId', selection.tierId);
             params.set('quantity', selection.quantity);
             params.set('type', 'general');
             router.push(`/payment?${params.toString()}`);
             return;
        }

        // For numbered seats, perform atomic reservation
        if (venue.type === 'numbered' && selection.seats) {
            const batch = writeBatch(firestore);
            const tenMinutesFromNow = Timestamp.fromMillis(Date.now() + 10 * 60 * 1000);

            try {
                // First, read all selected seats to check their status
                const seatDocsPromises = selection.seats.map((s: WithId<Seat>) => getDoc(doc(firestore, 'presentations', presentation.id, 'seats', s.id)));
                const seatDocs = await Promise.all(seatDocsPromises);
                
                let allAvailable = true;
                for (const seatDoc of seatDocs) {
                    if (!seatDoc.exists() || seatDoc.data().status !== 'available') {
                        allAvailable = false;
                        break;
                    }
                }
                
                if (!allAvailable) {
                    throw new Error("¡Lo sentimos! Uno o más de los asientos seleccionados ya no están disponibles. Por favor, elige otros.");
                }

                // If all are available, add them to the batch write
                seatDocs.forEach(seatDoc => {
                    batch.update(seatDoc.ref, {
                        status: 'reserved',
                        reservaExpiracion: tenMinutesFromNow,
                        reservaSesionId: user.uid,
                    });
                });

                await batch.commit();
                
                // On success, redirect to payment page
                const seatIds = selection.seats.map((s: WithId<Seat>) => s.id).join(',');
                let params = new URLSearchParams();
                params.set('presentationId', presentation.id);
                params.set('seatIds', seatIds);
                params.set('type', 'numbered');
                router.push(`/payment?${params.toString()}`);

            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error al reservar",
                    description: error.message || "No se pudieron reservar los asientos. Intenta de nuevo.",
                });
                // Optionally, refresh seat data here to show a user which ones were taken
            } finally {
                setIsReserving(false);
            }
        }
    };
    
    const isLoading = presentationLoading || eventLoading || venueLoading || tiersLoading || seatsLoading || isReserving;

    return (
        <div className="container">
            <div className="text-center mb-8">
                <Button variant="ghost" asChild className="absolute top-20 left-4">
                    <Link href={`/events/${eventId || ''}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Evento
                    </Link>
                </Button>
                <h1 className="font-headline text-3xl font-bold">Elige tus Boletos</h1>
                <Progress value={33} className="w-full max-w-md mx-auto mt-4" />
                <div className="grid grid-cols-3 text-sm max-w-md mx-auto mt-2 font-medium">
                    <span className="text-primary">Selección</span>
                    <span className="text-muted-foreground text-center">Pago</span>
                    <span className="text-muted-foreground text-right">Confirmación</span>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                          <CardTitle className="font-headline text-2xl">Paso 1: {venue?.type === 'general' ? 'Elige Localidad y Cantidad' : 'Elige tus Asientos'}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isLoading && <Skeleton className="h-48 w-full" />}

                        {!isLoading && venue?.type === 'general' && tiers && (
                            <GeneralAdmissionSelector presentation={presentation} tiers={tiers} onSelectionChange={setSelection} initialSelection={selection} />
                        )}

                        {!isLoading && venue?.type === 'numbered' && seatsData && (
                            <NumberedSeatSelector seats={seatsData} onSelectionChange={setSelection} initialSelection={selection} />
                        )}
                      </CardContent>
                    </Card>
                </div>
                <aside className="lg:col-span-1">
                    <OrderSummary 
                        presentation={presentation} 
                        eventData={eventData} 
                        venue={venue} 
                        selection={selection}
                        isLoading={isLoading} 
                        onContinue={handleContinueToPayment}
                    />
                </aside>
            </div>
        </div>
    );
}
