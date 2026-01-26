'use client';

import React from 'react';
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
        <div className="w-full min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 py-12 md:py-24 relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
            
            <div className="w-full max-w-6xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-headline text-4xl md:text-6xl font-bold tracking-tight">
                        Hablemos
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Estamos a un mensaje de distancia para ayudarte con tus boletos o eventos.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                        <Card className="h-full border-muted/60 shadow-xl bg-card/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" />Atención al Cliente</CardTitle>
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
                                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="tu@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                        <FormField control={form.control} name="reason" render={({ field }) => (
                                            <FormItem><FormLabel>Motivo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="purchase-doubt">Duda Compra</SelectItem><SelectItem value="ticket-issue">Problema Boleto</SelectItem><SelectItem value="event-info">Info Evento</SelectItem><SelectItem value="other">Otro</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="message" render={({ field }) => (
                                            <FormItem><FormLabel>Mensaje</FormLabel><FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <Button type="submit" className="w-full bg-primary" disabled={form.formState.isSubmitting}>
                                            {form.formState.isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="relative">
                        <div className="h-full bg-gray-950 text-white rounded-2xl p-8 flex flex-col justify-center shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/5 opacity-20" />
                            <div className="relative z-10 space-y-8">
                                <h3 className="font-headline text-3xl font-bold">Productores</h3>
                                <p className="text-gray-400 text-lg leading-relaxed">
                                    Transformamos tu evento con tecnología de punta. Desde la venta online hasta el acceso.
                                </p>
                                <div className="pt-8 border-t border-white/10">
                                    <p className="text-primary text-xs uppercase font-bold mb-2">Escríbenos</p>
                                    <a href="mailto:info@miboletoni.com" className="text-2xl font-bold hover:text-primary transition-colors flex items-center gap-3">
                                        <Mail className="w-6 h-6" /> info@miboletoni.com
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