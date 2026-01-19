'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm } from "@/app/actions/contact-actions";
import { Briefcase } from "lucide-react"; // <--- Importamos el icono para darle el toque pro

const contactSchema = z.object({
    name: z.string().min(2, { message: "El nombre es requerido." }),
    email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
    orderNumber: z.string().optional(),
    reason: z.string({ required_error: "Debes seleccionar un motivo." }),
    message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres." }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
    const { toast } = useToast();
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: '',
            email: '',
            orderNumber: '',
            message: '',
        }
    });

    const onSubmit = async (data: ContactFormValues) => {
        try {
            const result = await submitContactForm(data);
            if (result.success) {
                toast({
                    title: "¡Mensaje Enviado!",
                    description: "Gracias por contactarnos. Te responderemos lo antes posible.",
                });
                form.reset();
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error al enviar el mensaje",
                description: error.message || "Ocurrió un problema. Por favor, intenta de nuevo.",
            });
        }
    };

    return (
        <div className="container py-12 md:py-20">
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">
                    ¿Necesitas Ayuda? Contacta con MiBoletoNi
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    Estamos aquí para ayudarte. Elige la opción que mejor se adapte a tu consulta.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
                
                {/* COLUMNA IZQUIERDA: FORMULARIO DE USUARIOS */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Envíanos un Mensaje (Compradores)</CardTitle>
                        <CardDescription>
                            Antes de contactarnos, visita nuestras <a href="/faq" className="text-primary underline">FAQs</a>. ¡Tu respuesta podría estar allí!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre</FormLabel>
                                                <FormControl><Input placeholder="Tu nombre" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl><Input type="email" placeholder="tu@email.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="orderNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de Orden (Opcional)</FormLabel>
                                            <FormControl><Input placeholder="Ej: 12345" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reason"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Motivo de la Consulta</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona un motivo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="purchase-doubt">Duda sobre mi compra</SelectItem>
                                                    <SelectItem value="ticket-issue">Problema con mi boleto</SelectItem>
                                                    <SelectItem value="event-info">Información del evento</SelectItem>
                                                    <SelectItem value="other">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tu Mensaje</FormLabel>
                                            <FormControl><Textarea placeholder="Escribe tu mensaje aquí..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">Nuestro equipo te responderá en un plazo de 24 horas hábiles.</p>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* COLUMNA DERECHA: SECCIÓN COMERCIAL (COPY SÓLIDO) */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 flex flex-col justify-center shadow-sm h-full">
                    <div className="space-y-8">
                        {/* Encabezado con Icono */}
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white rounded-lg shadow-sm border border-primary/10">
                                <Briefcase className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-headline text-2xl font-bold text-foreground">
                                Alianzas Comerciales
                            </h3>
                        </div>
                        
                        {/* Cuerpo del Copy */}
                        <div className="space-y-4">
                            <p className="font-medium text-lg text-foreground">
                                ¿Eres productor? Lleva tu evento al siguiente nivel.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Digitaliza tu taquilla, asegura tus ingresos y ofrece una experiencia de compra premium. 
                                Nuestra plataforma te brinda <strong>pagos en línea seguros, reportes en tiempo real y control de acceso QR profesional</strong>.
                            </p>
                        </div>

                        {/* Footer con Email Clickable */}
                        <div className="pt-6 border-t border-primary/10">
                            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">
                                Contacto para Promotores
                            </h4>
                            <p className="text-muted-foreground mb-1">
                                Solicita una propuesta comercial escribiendo a:
                            </p>
                            <a 
                                href="mailto:info@miboletoni.com" 
                                className="text-2xl font-bold text-foreground hover:text-primary transition-colors inline-block underline decoration-primary/30 underline-offset-4"
                            >
                                info@miboletoni.com
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}