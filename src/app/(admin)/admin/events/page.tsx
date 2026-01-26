'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle, Loader2, MapPin, Clock, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Event, Venue, Presentation } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { motion } from "framer-motion";

// --- IMPORTACIONES DE ACCIONES (Usando Alias @ para evitar errores de ruta) ---
import { deleteEventAction, deleteVenueAction, deletePresentationAction } from '@/app/actions/admin-delete';
import { useToast } from '@/hooks/use-toast';
import { DeleteConfirmDialog } from '@/components/pages/admin/DeleteConfirmDialog';

// --- LISTA DE EVENTOS ---
function EventsList() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const eventsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'events')) : null, [firestore]);
    const { data: events, isLoading } = useCollection<Event>(eventsQuery);

    const onConfirmDelete = async (id: string) => {
        const res = await deleteEventAction(id);
        if (res.success) toast({ title: "Evento eliminado" });
        else toast({ variant: "destructive", title: "Error", description: res.error });
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

    return (
        <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">Nombre del Evento</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right pr-6">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events?.map((event) => (
                            <TableRow key={event.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium pl-6">{event.name}</TableCell>
                                <TableCell><Badge variant="outline" className="capitalize">{event.category}</Badge></TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/events/${event.id}/edit`}>Editar</Link>
                                        </Button>
                                        <DeleteConfirmDialog 
                                            itemName={event.name}
                                            title="¿Eliminar Evento?"
                                            description="Se borrará el evento"
                                            onConfirm={() => onConfirmDelete(event.id)}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// --- LISTA DE RECINTOS ---
function VenuesList() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const venuesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'venues')) : null, [firestore]);
    const { data: venues, isLoading } = useCollection<Venue>(venuesQuery);

    const onConfirmDelete = async (id: string) => {
        const res = await deleteVenueAction(id);
        if (res.success) toast({ title: "Recinto eliminado" });
        else toast({ variant: "destructive", title: "Error", description: res.error });
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

    return (
        <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">Recinto</TableHead>
                            <TableHead>Ciudad</TableHead>
                            <TableHead className="text-right pr-6">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {venues?.map((venue) => (
                            <TableRow key={venue.id}>
                                <TableCell className="font-medium pl-6">{venue.name}</TableCell>
                                <TableCell>{venue.city}</TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/venues/${venue.id}/edit`}>Editar</Link>
                                        </Button>
                                        <DeleteConfirmDialog 
                                            itemName={venue.name}
                                            title="¿Eliminar Recinto?"
                                            description="Se borrará el lugar"
                                            onConfirm={() => onConfirmDelete(venue.id)}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// --- LISTA DE PRESENTACIONES ---
function PresentationsList() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const presentationsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'presentations')) : null, [firestore]);
    const eventsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'events')) : null, [firestore]);
    const { data: presentations, isLoading } = useCollection<Presentation>(presentationsQuery);
    const { data: events } = useCollection<Event>(eventsQuery);
    const eventMap = useMemo(() => new Map(events?.map(e => [e.id, e.name])), [events]);

    const onConfirmDelete = async (eventId: string, presId: string) => {
        const res = await deletePresentationAction(eventId, presId);
        if (res.success) toast({ title: "Función eliminada" });
        else toast({ variant: "destructive", title: "Error" });
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

    return (
        <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">Evento</TableHead>
                            <TableHead>Fecha / Hora</TableHead>
                            <TableHead className="text-right pr-6">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {presentations?.map((p) => {
                            const eventName = eventMap.get(p.eventId) || 'Evento Desconocido';
                            const dateStr = p.eventDate?.toDate().toLocaleString('es-NI', { dateStyle: 'short', timeStyle: 'short' }) || "";
                            return (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium pl-6">{eventName}</TableCell>
                                    <TableCell>{dateStr}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/presentations/${p.id}`}>Ver</Link>
                                            </Button>
                                            <DeleteConfirmDialog 
                                                itemName={`${eventName} (${dateStr})`}
                                                title="¿Borrar Presentación?"
                                                description="Se eliminará esta función del calendario"
                                                onConfirm={() => onConfirmDelete(p.eventId, p.id)}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// --- PÁGINA PRINCIPAL ---
export default function AdminEventsPage() {
    const [activeTab, setActiveTab] = useState('events');

    const actionData = useMemo(() => {
        switch (activeTab) {
            case 'events': return { title: 'Nuevo Evento', href: '/admin/events/new' };
            case 'venues': return { title: 'Nuevo Recinto', href: '/admin/venues/new' };
            case 'presentations': return { title: 'Nueva Función', href: '/admin/presentations/new' };
            default: return { title: 'Crear', href: '#' };
        }
    }, [activeTab]);

    return (
        <div className="w-full min-h-screen bg-muted/20 flex flex-col items-center pb-20">
            {/* Header de la sección */}
            <header className="w-full bg-white border-b py-10 flex justify-center mb-8">
                <div className="w-full max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Configuración de Cartelera</h1>
                        <p className="text-muted-foreground mt-1 text-lg">Gestiona eventos, locales y fechas disponibles.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" asChild className="rounded-full">
                            <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link>
                        </Button>
                        <Button asChild className="rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-all">
                            <Link href={actionData.href}><PlusCircle className="mr-2 h-4 w-4" /> {actionData.title}</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Contenedor Principal Centrado */}
            <main className="w-full max-w-6xl mx-auto px-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white border shadow-sm p-1 rounded-lg">
                        <TabsTrigger value="events" className="px-6">Eventos</TabsTrigger>
                        <TabsTrigger value="venues" className="px-6">Recintos</TabsTrigger>
                        <TabsTrigger value="presentations" className="px-6">Presentaciones</TabsTrigger>
                    </TabsList>

                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <TabsContent value="events" className="mt-0"><EventsList /></TabsContent>
                        <TabsContent value="venues" className="mt-0"><VenuesList /></TabsContent>
                        <TabsContent value="presentations" className="mt-0"><PresentationsList /></TabsContent>
                    </motion.div>
                </Tabs>

                {/* Pie de página de soporte */}
                <section className="mt-20 p-10 rounded-3xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10 text-center max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">¿Necesitas soporte técnico?</h3>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Si tienes inconvenientes con el borrado de datos o necesitas asistencia avanzada con la plataforma, nuestro equipo está disponible.
                    </p>
                    <Button asChild variant="default" className="rounded-full px-10 py-6 h-auto text-lg shadow-md">
                        <Link href="/contact">Contactar al Administrador</Link>
                    </Button>
                </section>
            </main>
        </div>
    );
}