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
import { Briefcase, Mail, MessageSquare, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const contactSchema = z.object({
    name: z.string().min(2, { message: "El nombre es requerido." }),
    email: z.string().email({ message: "Introduce un correo válido." }),
    orderNumber: z.string().optional(),
    reason: z.string({ required_error: "Selecciona un motivo." }),
    message: z.string().min(10, { message: "Mínimo 10 caracteres." }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
    const { toast } = useToast();
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: { name: '', email: '', orderNumber: '', message: '' }
    });

    const onSubmit = async (data: ContactFormValues) => {
        try {
            const result = await submitContactForm(data);
            if (result.success) {
                toast({ title: "¡Mensaje Enviado!", description: "Te responderemos pronto." });
                form.reset();
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 py-12 md:py-24 relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] -z-10" />

            <div className="container relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-black/50 border shadow-sm text-sm font-medium mb-4"
                    >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Soporte Activo
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-headline text-4xl md:text-6xl font-bold tracking-tight"
                    >
                        Hablemos
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-muted-foreground max-w-2xl mx-auto"
                    >
                        Ya sea que tengas un problema con tu entrada o quieras organizar el evento del año, estamos a un mensaje de distancia.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* FORMULARIO */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card className="h-full border-muted/60 shadow-xl bg-card/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-primary" />
                                    Atención al Cliente
                                </CardTitle>
                                <CardDescription>Respuesta en menos de 24h hábiles.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="name" render={({ field }) => (
                                                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Tu nombre" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name="email" render={({ field }) => (
                                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="tu@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                        <FormField control={form.control} name="orderNumber" render={({ field }) => (
                                            <FormItem><FormLabel>Nº Orden (Opcional)</FormLabel><FormControl><Input placeholder="#12345" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="reason" render={({ field }) => (
                                            <FormItem><FormLabel>Motivo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="purchase-doubt">Duda Compra</SelectItem><SelectItem value="ticket-issue">Problema Boleto</SelectItem><SelectItem value="event-info">Info Evento</SelectItem><SelectItem value="other">Otro</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="message" render={({ field }) => (
                                            <FormItem><FormLabel>Mensaje</FormLabel><FormControl><Textarea placeholder="Cuéntanos..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity" disabled={form.formState.isSubmitting}>
                                            {form.formState.isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* SECCIÓN COMERCIAL (Diseño VIP) */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative h-full"
                    >
                        {/* Borde brillante animado */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 animate-pulse"></div>
                        
                        <div className="relative h-full bg-gray-900 text-white rounded-xl p-8 flex flex-col justify-center shadow-2xl overflow-hidden">
                            {/* Texture overlay */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                        <Briefcase className="h-8 w-8 text-purple-300" />
                                    </div>
                                    <div>
                                        <h3 className="font-headline text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                            Productores
                                        </h3>
                                        <p className="text-gray-400 text-sm">MiBoletoNi Business</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <p className="text-lg font-light leading-relaxed text-gray-200">
                                        Transformamos tu evento con tecnología de punta. Desde la venta online hasta el control de acceso en la puerta.
                                    </p>
                                    
                                    <ul className="space-y-3">
                                        {[
                                            "Pagos en línea seguros",
                                            "Reportes de ventas en tiempo real",
                                            "Escáner QR para control de acceso",
                                            "Marketing digital integrado"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                                <Sparkles className="w-4 h-4 text-purple-400" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="pt-8 border-t border-white/10">
                                    <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest font-bold">
                                        Escríbenos directamente
                                    </p>
                                    <a 
                                        href="mailto:info@miboletoni.com" 
                                        className="text-2xl font-bold text-white hover:text-purple-300 transition-colors flex items-center gap-3"
                                    >
                                        <Mail className="w-6 h-6" />
                                        info@miboletoni.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}