'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, Timestamp, query } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Event, Venue, WithId } from '@/lib/types';


import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, CalendarIcon } from 'lucide-react';

const presentationSchema = z.object({
  eventId: z.string({ required_error: "Debes seleccionar un evento." }),
  venueId: z.string({ required_error: "Debes seleccionar un recinto." }),
  eventDate: z.date({ required_error: "La fecha y hora son requeridas." }),
  status: z.enum(['A la venta', 'Pospuesto', 'Agotado', 'Cancelado'], { required_error: "Debes seleccionar un estado." }),
});

type PresentationFormValues = z.infer<typeof presentationSchema>;

export default function NewPresentationPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const eventsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'events')) : null, [firestore]);
  const { data: events, isLoading: eventsLoading } = useCollection<Event>(eventsQuery);
  
  const venuesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'venues')) : null, [firestore]);
  const { data: venues, isLoading: venuesLoading } = useCollection<Venue>(venuesQuery);

  const form = useForm<PresentationFormValues>({
    resolver: zodResolver(presentationSchema),
    defaultValues: {
      status: 'A la venta',
    },
  });

  const onSubmit = async (data: PresentationFormValues) => {
    if (!firestore) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo conectar a la base de datos." });
        return;
    }

    try {
      await addDoc(collection(firestore, 'presentations'), {
        ...data,
        eventDate: Timestamp.fromDate(data.eventDate),
      });
      toast({
        title: "¡Éxito!",
        description: `La nueva presentación ha sido creada.`,
      });
      router.push('/admin/events');
    } catch (error: any) {
      console.error("Error creating presentation: ", error);
      toast({
        variant: "destructive",
        title: "Error al crear la presentación",
        description: error.message || "Ocurrió un error inesperado.",
      });
    }
  };
  
  const isLoading = form.formState.isSubmitting || eventsLoading || venuesLoading;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Crear Nueva Presentación</h1>
                <p className="text-muted-foreground">Define una fecha y lugar específico para un evento.</p>
            </div>
             <Button variant="ghost" asChild>
                <Link href="/admin/events"><ArrowLeft className="mr-2 h-4 w-4" /> Cancelar y Volver</Link>
            </Button>
        </div>
        
        <Card>
            <CardContent className="pt-6">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="eventId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Evento Base</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={eventsLoading}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={eventsLoading ? "Cargando eventos..." : "Selecciona el evento"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {events?.map((event: WithId<Event>) => (
                                                <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="venueId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Recinto (Lugar)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={venuesLoading}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={venuesLoading ? "Cargando recintos..." : "Selecciona el recinto"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {venues?.map((venue: WithId<Venue>) => (
                                                <SelectItem key={venue.id} value={venue.id}>{venue.name} ({venue.city})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="eventDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Fecha y Hora</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP HH:mm", { locale: es })
                                            ) : (
                                                <span>Elige una fecha</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < new Date()}
                                            initialFocus
                                        />
                                        {/* Basic time picker - can be improved */}
                                        <div className="p-3 border-t border-border">
                                            <input type="time" className="w-full border-input" onChange={(e) => {
                                                const newDate = new Date(field.value);
                                                const [hours, minutes] = e.target.value.split(':');
                                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                                field.onChange(newDate);
                                            }} />
                                        </div>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                         <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado Inicial de Venta</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona el estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="A la venta">A la venta</SelectItem>
                                            <SelectItem value="Pospuesto">Pospuesto</SelectItem>
                                            <SelectItem value="Agotado">Agotado</SelectItem>
                                            <SelectItem value="Cancelado">Cancelado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Guardando..." : "Guardar Presentación"}
                        </Button>
                    </form>
                 </Form>
            </CardContent>
        </Card>
    </div>
  );
}
