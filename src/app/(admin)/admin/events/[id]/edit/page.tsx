
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Event } from '@/lib/types';


const eventSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  category: z.string({ required_error: "Debes seleccionar una categoría." }),
  description: z.string().optional(),
  imageUrl: z.string().url({ message: "Por favor, introduce una URL de imagen válida." }).optional().or(z.literal('')),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const eventRef = useMemoFirebase(() => firestore && eventId ? doc(firestore, 'events', eventId) : null, [firestore, eventId]);
  const { data: event, isLoading: eventLoading } = useDoc<Event>(eventRef);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      category: undefined,
      description: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (event) {
      form.reset({
        name: event.name,
        category: event.category,
        description: event.description || '',
        imageUrl: event.imageUrl || '',
      });
    }
  }, [event, form]);

  const onSubmit = async (data: EventFormValues) => {
    if (!firestore || !eventId) return;

    try {
      const docRef = doc(firestore, 'events', eventId);
      await updateDoc(docRef, {
        ...data,
        imageUrl: data.imageUrl || '',
      });
      toast({
        title: "¡Éxito!",
        description: `El evento "${data.name}" ha sido actualizado.`,
      });
      router.push('/admin/events');
    } catch (error: any) {
      console.error("Error updating event: ", error);
      toast({
        variant: "destructive",
        title: "Error al actualizar el evento",
        description: error.message || "Ocurrió un error inesperado.",
      });
    }
  };

  if (eventLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!event) {
    return <div className="text-center p-8">No se encontró el evento.</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Editar Evento</h1>
                <p className="text-muted-foreground">Modifica los detalles de tu evento.</p>
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
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Evento</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Concierto de Verano" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoría</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una categoría para el evento" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Conciertos y Festivales">Conciertos y Festivales</SelectItem>
                                            <SelectItem value="Teatro">Teatro</SelectItem>
                                            <SelectItem value="Deportes">Deportes</SelectItem>
                                            <SelectItem value="Expo y Ferias">Expo y Ferias</SelectItem>
                                            <SelectItem value="Otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe el evento, artistas invitados, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL de la Imagen del Evento (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </form>
                 </Form>
            </CardContent>
        </Card>
    </div>
  );
}
