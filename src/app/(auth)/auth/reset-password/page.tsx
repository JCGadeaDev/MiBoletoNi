'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react'; // Agregué iconos para mejor UX

// IMPORTANTE: Importamos la Server Action en lugar del SDK de Firebase
import { sendPasswordResetLink } from '@/app/actions/auth-actions';

const resetSchema = z.object({
  email: z.string().email('Por favor, introduce un correo electrónico válido.'),
});

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof resetSchema>) => {
    try {
      // 1. Convertimos los datos del formulario a FormData
      // (Porque tu Server Action espera FormData)
      const formData = new FormData();
      formData.append('email', values.email);

      // 2. Llamamos a tu Server Action (Resend + Firebase Admin)
      const result = await sendPasswordResetLink(formData);

      // 3. Manejamos la respuesta
      if (result.success) {
        toast({
          title: 'Correo enviado',
          description: result.message,
          variant: 'default',
        });
        setIsSubmitted(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Error enviando link:', error);
      toast({
        variant: 'destructive',
        title: 'Error inesperado',
        description: 'Hubo un problema de conexión. Intenta nuevamente.',
      });
    }
  };

  return (
    // Agregué un wrapper para centrarlo en pantalla, si tu layout ya lo hace puedes quitar el div externo
    <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">¿Olvidó su contraseña?</CardTitle>
            <CardDescription>
            No se preocupe, le enviaremos un enlace seguro para restablecerla.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {isSubmitted ? (
            <div className="text-center space-y-4 py-4">
                <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
                    <p className="font-semibold">¡Correo enviado exitosamente!</p>
                    <p className="text-sm mt-1">Por favor, revise su bandeja de entrada (y spam).</p>
                </div>
                <Button variant="outline" onClick={() => setIsSubmitted(false)} className="mt-4">
                    Intentar con otro correo
                </Button>
            </div>
            ) : (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                        <Input placeholder="tu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        'Enviar Enlace'
                    )}
                </Button>
                </form>
            </Form>
            )}
            
            <div className="mt-6 text-center">
                <Button variant="link" asChild className="text-muted-foreground hover:text-primary">
                    <Link href="/auth" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Regresar al Ingreso
                    </Link>
                </Button>
            </div>
        </CardContent>
        </Card>
    </div>
  );
}