
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, useAuth } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';


const eventSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  category: z.string({ required_error: "Debes seleccionar una categoría." }),
  description: z.string().optional(),
  imageUrl: z.string().url({ message: "Por favor, introduce una URL de imagen válida." }).optional().or(z.literal('')),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function NewEventPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      category: undefined,
      description: '',
      imageUrl: '',
    },
  });

  const onSubmit = async (data: EventFormValues) => {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Error de Conexión",
            description: "No se pudo conectar a la base de datos.",
        });
        return;
    }

    try {
      console.log("DEBUG: Submitting event with user:", firestore, auth.currentUser);
      // Retrieve the latest token result to check claims
      const tokenResult = await auth.currentUser?.getIdTokenResult(true);
      console.log("DEBUG: User Claims:", tokenResult?.claims);

      if (tokenResult?.claims?.role !== 'admin') {
          toast({
            variant: "destructive",
            title: "Error de Permisos",
            description: `Tu rol actual es '${tokenResult?.claims?.role || 'ninguno'}'. Necesitas ser 'admin'. Intenta cerrar sesión y volver a entrar.`,
          });
          return;
      }

      await addDoc(collection(firestore, 'events'), {
        ...data,
        imageUrl: data.imageUrl || '', // Ensure imageUrl is not undefined
      });
      toast({
        title: "¡Éxito!",
        description: `El evento "${data.name}" ha sido creado.`,
      });
      router.push('/admin/events');
    } catch (error: any) {
      console.error("Error creating event: ", error);
      toast({
        variant: "destructive",
        title: "Error al crear el evento",
        description: error.message || "Ocurrió un error inesperado.",
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Evento</h1>
                <p className="text-muted-foreground">Completa los detalles básicos de tu nuevo evento.</p>
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                    <FormLabel>Imagen del Evento</FormLabel>
                                    <FormControl>
                                        <ImageUpload 
                                            value={field.value || ''} 
                                            onChange={(url) => field.onChange(url)}
                                            disabled={form.formState.isSubmitting}
                                            folder="events"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Guardando..." : "Guardar Evento"}
                        </Button>
                    </form>
                 </Form>
            </CardContent>
        </Card>
    </div>
  );
}
