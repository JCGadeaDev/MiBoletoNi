'use client';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { doc } from "firebase/firestore";
import type { Presentation, Event, Venue, Seat } from "@/lib/types";

// Import custom hooks
import { useReservationTimer, useSelectionData } from "@/hooks/payment";
import type { PurchaseData } from "@/interfaces/payment";

import { BuyerInfo, OrderSummary } from "@/components/checkout";
import { FygaroButton } from "@/components/payment/FygaroButton";

export default function PaymentPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const firestore = useFirestore();

    // --- 1. CARGA DE DATOS DEL PERFIL (FIRESTORE) ---
    // Esto es vital porque user.phoneNumber suele ser null si el registro fue por email
    const userDocRef = useMemoFirebase(
        () => (firestore && user?.uid ? doc(firestore, 'users', user.uid) : null),
        [firestore, user?.uid]
    );
    const { data: userData, isLoading: uLoading } = useDoc<any>(userDocRef);

    // --- 2. EXTRACCIÓN DE PARÁMETROS URL ---
    const presentationId = searchParams.get('presentationId');
    const type = searchParams.get('type') as 'general' | 'numbered' | null;
    const tierId = searchParams.get('tierId');
    const quantity = parseInt(searchParams.get('quantity') || '0', 10);
    const seatIds = useMemo(() => searchParams.get('seatIds')?.split(','), [searchParams]);

    // --- 3. CARGA DE DATOS DE LA PRESENTACIÓN, EVENTO Y LOCAL ---
    const presentationRef = useMemoFirebase(
        () => (firestore && presentationId ? doc(firestore, 'presentations', presentationId) : null),
        [firestore, presentationId]
    );
    const { data: presentation, isLoading: pLoading } = useDoc<Presentation>(presentationRef);

    const eventRef = useMemoFirebase(
        () => (firestore && presentation?.eventId ? doc(firestore, 'events', presentation.eventId) : null),
        [firestore, presentation]
    );
    const { data: event, isLoading: eLoading } = useDoc<Event>(eventRef);

    const venueRef = useMemoFirebase(
        () => (firestore && presentation?.venueId ? doc(firestore, 'venues', presentation.venueId) : null),
        [firestore, presentation]
    );
    const { data: venue, isLoading: vLoading } = useDoc<Venue>(venueRef);

    // --- 4. HOOKS DE SELECCIÓN Y TIEMPO ---
    const { selectionData, isLoading: selectionLoading } = useSelectionData(
        type,
        presentationId,
        tierId,
        quantity,
        seatIds
    );

    const { formattedTime, timedOut } = useReservationTimer(
        presentationId,
        seatIds,
        type,
        event?.id
    );

    // --- 5. LÓGICA DE NEGOCIO (RESUMEN Y COMPRA) ---
    const summary = useMemo(() => {
        if (!selectionData || !venue) return { items: [], totalPrice: 0, currency: 'USD', count: 0 };

        if (venue.type === 'general' && 'tierId' in selectionData) {
            return {
                items: [{
                    name: `${selectionData.quantity} x ${selectionData.tierName}`,
                    price: selectionData.price * selectionData.quantity
                }],
                totalPrice: selectionData.price * selectionData.quantity,
                currency: selectionData.currency || 'USD',
                count: selectionData.quantity,
            };
        }

        if (venue.type === 'numbered' && 'seats' in selectionData) {
            const totalPrice = selectionData.seats.reduce((acc, seat) => acc + seat.price, 0);
            return {
                items: selectionData.seats.map(s => ({ name: `Asiento ${s.row}${s.number}`, price: s.price })),
                totalPrice,
                currency: selectionData.seats[0]?.currency || 'USD',
                count: selectionData.seats.length,
            };
        }
        return { items: [], totalPrice: 0, currency: 'USD', count: 0 };
    }, [selectionData, venue]);

    const purchaseData: PurchaseData | null = useMemo(() => {
        if (!presentationId || !selectionData || !user || !summary) return null;
        let tickets: any[] = [];
        if (type === 'general' && 'tierId' in selectionData) {
            tickets = [{ tierId: selectionData.tierId, tierName: selectionData.tierName, quantity: selectionData.quantity, price: selectionData.price }];
        } else if (type === 'numbered' && 'seats' in selectionData) {
            tickets = selectionData.seats.map(s => ({ seatId: s.id, section: s.section, row: s.row, number: s.number, price: s.price }));
        }
        return { presentationId, tickets, type: type!, totalPrice: summary.totalPrice, currency: summary.currency };
    }, [presentationId, selectionData, user, summary, type]);

    // --- 6. EFECTOS DE REDIRECCIÓN ---
    useEffect(() => {
        if (!isUserLoading && !user) {
            const fullRedirectPath = `/payment?${searchParams.toString()}`;
            router.replace(`/auth?redirect=${encodeURIComponent(fullRedirectPath)}`);
        }
    }, [user, isUserLoading, router, searchParams]);

    // --- 7. ESTADOS DE RENDERIZADO (LOADING / TIMEOUT) ---
    const isLoading = isUserLoading || uLoading || pLoading || eLoading || vLoading || selectionLoading;

    if (isLoading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="animate-pulse text-muted-foreground">Preparando tu orden segura...</p>
            </div>
        );
    }

    if (!user || timedOut) {
        return (
            <div className="container py-20 text-center">
                <Card className="mx-auto max-w-md p-8">
                    <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Reserva Expirada</h2>
                    <p className="text-muted-foreground mb-6">El tiempo para completar la compra ha terminado.</p>
                    <Button asChild><Link href={`/events/${event?.id || ''}`}>Reiniciar Selección</Link></Button>
                </Card>
            </div>
        );
    }

    // El teléfono lo sacamos prioritariamente de Firestore (userData)
    const validPhone = userData?.phone || userData?.phoneNumber || user?.phoneNumber;

    return (
        <div className="container py-8 max-w-7xl">
            <div className="text-center mb-10 relative">
                <Button variant="ghost" asChild className="absolute left-0 top-0 hidden md:flex">
                    <Link href={`/checkout?${searchParams.toString()}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Finalizar Compra</h1>
                <Progress value={66} className="w-full max-w-md mx-auto mt-6" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Información del Comprador */}
                    <BuyerInfo
                        displayName={userData?.name || user.displayName}
                        email={user.email}
                        phone={validPhone}
                    />

                    {/* Pasarela de Pago */}
                    <Card className="border-primary/20 shadow-md">
                        <CardHeader>
                             <CardTitle>Método de Pago Seguro</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!validPhone ? (
                                <div className="rounded-lg bg-destructive/10 p-4 text-destructive border border-destructive/20">
                                    <p className="font-semibold">⚠️ Teléfono Requerido</p>
                                    <p className="text-sm">Para pagar con Fygaro es obligatorio tener un número de contacto en tu perfil.</p>
                                    <Button variant="link" className="p-0 h-auto text-destructive underline" onClick={() => router.push('/profile')}>
                                        Actualizar mi perfil aquí
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-muted-foreground">
                                        Al hacer clic, serás redirigido a <strong>Fygaro</strong> para procesar tu tarjeta de forma segura.
                                    </p>
                                    {purchaseData && (
                                        <FygaroButton
                                            amount={summary.totalPrice}
                                            currency={summary.currency}
                                            description={`Boletos: ${event?.name || 'Evento'}`}
                                            purchaseData={purchaseData}
                                            userId={user.uid}
                                            userEmail={user.email || ''}
                                            userPhone={validPhone} // <--- Enviamos el teléfono verificado
                                            onError={(msg) => alert(`Error en pasarela: ${msg}`)}
                                        />
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <aside className="lg:col-span-1">
                    <OrderSummary
                        type={type}
                        eventName={event?.name}
                        venueName={venue?.name}
                        eventDate={presentation?.eventDate?.toDate().toLocaleString('es-NI')}
                        items={summary.items}
                        totalPrice={summary.totalPrice}
                        currency={summary.currency}
                        showTimer={type === 'numbered'}
                        formattedTime={formattedTime}
                    />
                </aside>
            </div>
        </div>
    );
}