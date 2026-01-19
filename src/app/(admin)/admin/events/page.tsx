
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Event, Venue, Presentation, WithId } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// --- Componente para la lista de Eventos ---
function EventsList() {
    const firestore = useFirestore();
    const eventsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'events')) : null, [firestore]);
    const { data: events, isLoading, error } = useCollection<Event>(eventsQuery);

    if (isLoading) return <p>Cargando eventos...</p>;
    if (error) return <p className="text-destructive">Error al cargar eventos: {error.message}</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Todos los Eventos</CardTitle>
                <CardDescription>Conceptos base de eventos. Cada uno puede tener múltiples presentaciones.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events?.map((event) => (
                            <TableRow key={event.id}>
                                <TableCell className="font-medium">{event.name}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{event.category}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/events/${event.id}/edit`}>Editar</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {events?.length === 0 && <p className="p-4 text-center text-muted-foreground">No se encontraron eventos.</p>}
            </CardContent>
        </Card>
    );
}

// --- Componente para la lista de Recintos ---
function VenuesList() {
    const firestore = useFirestore();
    const venuesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'venues')) : null, [firestore]);
    const { data: venues, isLoading, error } = useCollection<Venue>(venuesQuery);

    if (isLoading) return <p>Cargando recintos...</p>;
    if (error) return <p className="text-destructive">Error al cargar recintos: {error.message}</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Todos los Recintos</CardTitle>
                <CardDescription>Lugares donde se realizan los eventos.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre del Recinto</TableHead>
                            <TableHead>Ciudad</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {venues?.map((venue) => (
                            <TableRow key={venue.id}>
                                <TableCell className="font-medium">{venue.name}</TableCell>
                                <TableCell>{venue.city}</TableCell>
                                <TableCell>
                                    <Badge variant={venue.type === 'numbered' ? 'default' : 'outline'}>
                                        {venue.type === 'numbered' ? 'Numerado' : 'General'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                     <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/venues/${venue.id}/edit`}>Editar</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {venues?.length === 0 && <p className="p-4 text-center text-muted-foreground">No se encontraron recintos.</p>}
            </CardContent>
        </Card>
    );
}

// --- Componente para la lista de Presentaciones ---
function PresentationsList() {
    const firestore = useFirestore();

    // Hooks para cargar todas las colecciones necesarias
    const presentationsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'presentations')) : null, [firestore]);
    const eventsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'events')) : null, [firestore]);
    const venuesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'venues')) : null, [firestore]);

    const { data: presentations, isLoading: presentationsLoading, error: presentationsError } = useCollection<Presentation>(presentationsQuery);
    const { data: events, isLoading: eventsLoading, error: eventsError } = useCollection<Event>(eventsQuery);
    const { data: venues, isLoading: venuesLoading, error: venuesError } = useCollection<Venue>(venuesQuery);

    const isLoading = presentationsLoading || eventsLoading || venuesLoading;
    const error = presentationsError || eventsError || venuesError;

    // Crear mapas para búsqueda rápida de nombres
    const eventMap = useMemo(() => new Map(events?.map(e => [e.id, e.name])), [events]);
    const venueMap = useMemo(() => new Map(venues?.map(v => [v.id, v.name])), [venues]);

    if (isLoading) return <p>Cargando presentaciones...</p>;
    if (error) return <p className="text-destructive">Error al cargar datos: {error.message}</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Todas las Presentaciones</CardTitle>
                <CardDescription>Instancias específicas de un evento en un lugar y fecha determinados.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Evento</TableHead>
                            <TableHead>Recinto</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {presentations?.map((p) => (
                             <TableRow key={p.id}>
                                <TableCell className="font-medium">{eventMap.get(p.eventId) || p.eventId}</TableCell>
                                <TableCell>{venueMap.get(p.venueId) || p.venueId}</TableCell>
                                <TableCell>{p.eventDate?.toDate().toLocaleString('es-NI', { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                                <TableCell>
                                    <Badge variant={p.status === 'A la venta' ? 'default' : 'destructive'}>{p.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/presentations/${p.id}`}>Gestionar</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {presentations?.length === 0 && <p className="p-4 text-center text-muted-foreground">No se encontraron presentaciones.</p>}
            </CardContent>
        </Card>
    );
}


// --- Componente Principal de la Página ---

export default function AdminEventsPage() {
    const [activeTab, setActiveTab] = useState('events');

    const getActionProps = () => {
        switch (activeTab) {
            case 'events': 
                return { title: 'Nuevo Evento', href: '/admin/events/new' };
            case 'venues': 
                return { title: 'Nuevo Recinto', href: '/admin/venues/new' };
            case 'presentations': 
                return { title: 'Nueva Presentación', href: '/admin/presentations/new' };
            default: 
                return { title: 'Crear Nuevo', href: '#' };
        }
    };

    const { title, href } = getActionProps();

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Eventos</h1>
                    <p className="text-muted-foreground">Crea, edita y administra eventos, recintos y presentaciones.</p>
                </div>
                 <div className="flex items-center space-x-2">
                     <Button variant="ghost" asChild>
                        <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Regresar al Panel</Link>
                    </Button>
                    <Button asChild>
                        <Link href={href}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {title}
                        </Link>
                    </Button>
                 </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="events">Eventos</TabsTrigger>
                    <TabsTrigger value="venues">Recintos</TabsTrigger>
                    <TabsTrigger value="presentations">Presentaciones</TabsTrigger>
                </TabsList>
                <TabsContent value="events">
                    <EventsList />
                </TabsContent>
                <TabsContent value="venues">
                    <VenuesList />
                </TabsContent>
                <TabsContent value="presentations">
                    <PresentationsList />
                </TabsContent>
            </Tabs>
        </div>
    );
}
