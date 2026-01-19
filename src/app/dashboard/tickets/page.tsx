'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, orderBy, doc, getDocs, where } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, Ticket as TicketIcon, MapPin, 
  Clock, Printer, Copy, ShoppingBag 
} from "lucide-react";

import type { Order, Presentation, Event as EventType, Venue } from "@/lib/types";

// --- COMPONENTE: VOUCHER DE CANJE ---
function TicketVoucherDialog({ 
  order, 
  eventName, 
  venueName, 
  ticketDescription,
  userName
}: { 
  order: Order & { id: string }, 
  eventName: string,
  eventDate: Date,
  venueName: string,
  ticketDescription: string,
  userName?: string
}) {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(order.id);
        alert("ID de Orden copiado al portapapeles");
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto gap-2 bg-amber-600 hover:bg-amber-700 text-white border-amber-800">
                    <Printer className="h-4 w-4" />
                    Ver Código de Canje
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white text-zinc-900 p-0 overflow-hidden gap-0 border-none shadow-2xl">
                <div className="bg-zinc-900 p-6 text-center">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl font-bold tracking-tight">Comprobante de Canje</DialogTitle>
                        <DialogDescription className="text-zinc-400 mt-2">
                            Muestra este código en el punto de venta autorizado para recibir tus boletos físicos.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 bg-white relative">
                    <div className="absolute top-1/2 left-0 -mt-3 -ml-3 w-6 h-6 rounded-full bg-zinc-900" />
                    <div className="absolute top-1/2 right-0 -mt-3 -mr-3 w-6 h-6 rounded-full bg-zinc-900" />

                    <div className="text-center space-y-6">
                        <div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                                TU NÚMERO DE ORDEN
                            </p>
                            <div 
                                onClick={copyToClipboard}
                                className="bg-zinc-100 border-2 border-dashed border-zinc-300 p-4 rounded-xl cursor-pointer hover:bg-zinc-200 transition-colors group relative"
                            >
                                <p className="font-mono text-3xl sm:text-4xl font-black tracking-wider text-zinc-900 break-all">
                                    {order.id.slice(0, 8).toUpperCase()}
                                </p>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Copy className="h-4 w-4 text-zinc-400" />
                                </div>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-1">Clic para copiar el código completo</p>
                        </div>

                        <Separator />

                        <div className="text-left space-y-3 bg-amber-50 p-4 rounded-lg border border-amber-100">
                            <p className="text-xs font-bold text-amber-800 uppercase mb-2">Detalles a verificar:</p>
                            
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500">Titular:</span>
                                <span className="font-semibold text-zinc-900">{userName || 'Usuario'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500">Evento:</span>
                                <span className="font-semibold text-zinc-900 text-right line-clamp-1 pl-2">{eventName}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500">Ubicación:</span>
                                <span className="font-semibold text-zinc-900">{venueName}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500">Boletos:</span>
                                <span className="font-bold text-amber-700">{ticketDescription}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-zinc-100 p-4 text-center border-t border-zinc-200 flex justify-center items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        PAGADO - LISTO PARA CANJE
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// --- CARD DEL EVENTO ---
function UpcomingEventCard({ order, userName }: { order: Order & { id: string }, userName?: string }) {
    const firestore = useFirestore();

    const presentationRef = useMemoFirebase(() => {
        if (!firestore || !order.presentationId) return null;
        return doc(firestore, 'presentations', order.presentationId);
    }, [firestore, order.presentationId]);
    const { data: presentation, isLoading: presentationLoading } = useDoc<Presentation>(presentationRef);

    const eventRef = useMemoFirebase(() => {
        if (!firestore || !presentation?.eventId) return null;
        return doc(firestore, 'events', presentation.eventId);
    }, [firestore, presentation?.eventId]);
    const { data: event, isLoading: eventLoading } = useDoc<EventType>(eventRef);

    const venueRef = useMemoFirebase(() => {
        if (!firestore || !presentation?.venueId) return null;
        return doc(firestore, 'venues', presentation.venueId);
    }, [firestore, presentation?.venueId]);
    const { data: venue, isLoading: venueLoading } = useDoc<Venue>(venueRef);

    const isLoading = presentationLoading || eventLoading || venueLoading;
    
    if (isLoading) {
        return (
             <Card className="flex flex-col sm:flex-row items-stretch overflow-hidden mb-6">
                <Skeleton className="relative w-full sm:w-1/3 md:w-1/4 aspect-video sm:aspect-auto bg-muted" />
                <CardContent className="p-4 sm:p-6 w-full flex flex-col space-y-2">
                    <Skeleton className="h-6 w-3/4 bg-muted rounded" />
                    <Skeleton className="h-4 w-1/2 bg-muted rounded" />
                    <Skeleton className="h-10 w-full bg-muted rounded mt-auto" />
                </CardContent>
            </Card>
        )
    }
    
    if (!event || !presentation) return null;

    const firstTicket = order.tickets?.[0];
    const ticketDescription = firstTicket?.tierName 
        ? `${firstTicket.quantity} x ${firstTicket.tierName}` 
        : `${order.tickets?.length || 0} x Boletos`;

    const imageUrl = event.imageUrl || `https://picsum.photos/seed/${event.id}/600/400`;
    const eventDate = presentation.eventDate?.toDate ? presentation.eventDate.toDate() : new Date();

    return (
        <Card className="flex flex-col sm:flex-row items-stretch overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500 mb-6">
            <div className="relative w-full sm:w-1/3 md:w-1/4 aspect-video sm:aspect-auto bg-muted">
                <Image src={imageUrl} alt={event.name} fill className="object-cover" />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg text-center shadow-sm">
                    <p className="text-xs font-bold text-red-500 uppercase">{eventDate.toLocaleDateString('es-NI', { month: 'short' })}</p>
                    <p className="text-xl font-black text-gray-900 leading-none">{eventDate.getDate()}</p>
                </div>
            </div>
            
            <CardContent className="p-4 sm:p-6 w-full flex flex-col">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold line-clamp-1">{event.name}</h3>
                        <div className="flex items-center text-sm font-medium text-primary mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {venue?.name}, {venue?.city}
                        </div>
                    </div>
                </div>

                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center">
                        <Clock className="h-3 w-3 mr-2 text-gray-400" />
                        {eventDate.toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="flex items-center">
                        <TicketIcon className="h-3 w-3 mr-2 text-gray-400" />
                        {ticketDescription}
                    </p>
                </div>

                <div className="flex-grow" />
                <Separator className="my-3 sm:my-4" />
                
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="flex flex-col">
                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Referencia de Orden</p>
                        <p className="text-sm font-mono text-foreground font-semibold">
                            #{order.id.slice(0,8).toUpperCase()}
                        </p>
                    </div>
                    
                    <TicketVoucherDialog 
                        order={order} 
                        eventName={event.name}
                        eventDate={eventDate}
                        venueName={venue?.name || 'Ubicación por definir'}
                        ticketDescription={ticketDescription}
                        userName={userName}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

// --- PÁGINA PRINCIPAL ---
export default function MyTicketsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    
    const [orders, setOrders] = useState<(Order & { id: string })[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/auth/login?redirect=/dashboard/tickets');
        }
    }, [user, isUserLoading, router]);

    useEffect(() => {
        async function fetchOrders() {
            if (!firestore || !user) return;
            setLoadingOrders(true);
            try {
                // CORRECCIÓN: Filtrar por status 'completed'
                const path = `users/${user.uid}/orders`;
                const q = query(
                    collection(firestore, path), 
                    where("status", "==", "completed"),
                    orderBy("purchaseDate", "desc")
                );
                
                const snapshot = await getDocs(q);
                const loadedOrders = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as (Order & { id: string })[];

                setOrders(loadedOrders);
            } catch (err) {
                console.error("Error cargando boletos:", err);
            } finally {
                setLoadingOrders(false);
            }
        }

        if (!isUserLoading && user) fetchOrders();
    }, [firestore, user, isUserLoading]);

    if (isUserLoading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;
    if (!user) return null; 

    return (
        <div className="container py-8 sm:py-12">
            <div className="max-w-4xl mx-auto">
                <Button variant="ghost" asChild className="mb-6 -ml-4">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Mi Cuenta
                    </Link>
                </Button>
                
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Mis Boletos</h1>
                    <p className="text-muted-foreground">
                        Presenta estos códigos en los puntos de canje autorizados.
                    </p>
                </div>

                <div className="space-y-6">
                    {loadingOrders ? (
                        <div className="space-y-4">
                           <UpcomingEventCard order={{} as any} userName={user.displayName || ''} />
                           <UpcomingEventCard order={{} as any} userName={user.displayName || ''} />
                        </div>
                    ) : orders.length > 0 ? (
                        orders.map(order => (
                            <UpcomingEventCard 
                                key={order.id} 
                                order={order} 
                                userName={user.displayName || user.email || ''} 
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-muted">
                            <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border">
                                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold">No tienes boletos todavía</h3>
                            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                                Tus entradas confirmadas aparecerán aquí para que puedas canjearlas.
                            </p>
                            <Button asChild className="mt-6 bg-primary">
                                <Link href="/events">Explorar Eventos</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}