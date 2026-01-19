'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';

const venueSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  city: z.string().min(3, { message: "El nombre de la ciudad es requerido." }),
  type: z.enum(['general', 'numbered'], { required_error: "Debes seleccionar un tipo de recinto." }),
  seatMapImageUrl: z.string().url({ message: "Debe ser una URL válida." }).optional().or(z.literal('')),
});

type VenueFormValues = z.infer<typeof venueSchema>;

export default function NewVenuePage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: '',
      city: '',
      type: undefined,
      seatMapImageUrl: '',
    },
  });

  const onSubmit = async (data: VenueFormValues) => {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Error de Conexión",
            description: "No se pudo conectar a la base de datos.",
        });
        return;
    }

    try {
      await addDoc(collection(firestore, 'venues'), {
        ...data,
        seatMapImageUrl: data.seatMapImageUrl || '', 
      });
      toast({
        title: "¡Éxito!",
        description: `El recinto "${data.name}" ha sido creado.`,
      });
      router.push('/admin/events');
    } catch (error: any) {
      console.error("Error creating venue: ", error);
      toast({
        variant: "destructive",
        title: "Error al crear el recinto",
        description: error.message || "Ocurrió un error inesperado.",
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Recinto</h1>
                <p className="text-muted-foreground">Completa los detalles de la nueva ubicación para eventos.</p>
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
                                    <FormLabel>Nombre del Recinto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Estadio Soberanía" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ciudad</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Managua" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Admisión</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona el tipo de venta" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="general">Admisión General</SelectItem>
                                            <SelectItem value="numbered">Asientos Numerados</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="seatMapImageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Plano del Recinto (Opcional)</FormLabel>
                                    <FormControl>
                                        <ImageUpload 
                                            value={field.value || ''} 
                                            onChange={(url) => field.onChange(url)}
                                            disabled={form.formState.isSubmitting}
                                            folder="venues"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Guardando..." : "Guardar Recinto"}
                        </Button>
                    </form>
                 </Form>
            </CardContent>
        </Card>
    </div>
  );
}
