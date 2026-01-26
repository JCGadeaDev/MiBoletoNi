'use client';

import React, { useState } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    HelpCircle, 
    CreditCard, 
    Ticket, 
    AlertCircle, 
    Undo2, 
    ShieldCheck,
    Store
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

const faqs = [
    {
        category: "Proceso de Compra",
        icon: CreditCard,
        questions: [
            { q: "¿Cómo compro boletos en MiBoletoNi?", a: "Es muy sencillo: Selecciona tu evento favorito, elige la localidad y cantidad de boletos, completa tus datos de pago de forma segura y ¡listo! Tus boletos llegarán a tu correo electrónico inmediatamente." },
            { q: "¿Qué métodos de pago aceptan?", a: "Aceptamos todas las tarjetas de crédito y débito Visa y MasterCard a través de nuestra pasarela de pago segura. También contamos con opciones de pago en puntos de venta físicos autorizados." },
            { q: "¿Es seguro comprar en línea?", a: "Totalmente. Utilizamos encriptación SSL y procesadores de pago certificados para garantizar que tu información financiera esté protegida en todo momento." }
        ]
    },
    {
        category: "Mis Boletos y Acceso",
        icon: Ticket,
        questions: [
            { q: "No he recibido mis boletos por correo", a: "Primero, revisa tu carpeta de Correo No Deseado o SPAM. Si no los encuentras, puedes iniciar sesión en tu cuenta en MiBoletoNi y descargarlos directamente desde la sección 'Mis Boletos'." },
            { q: "¿Debo imprimir mi boleto?", a: "No es estrictamente necesario. Puedes presentar el código QR desde tu celular al llegar al evento. Solo asegúrate de tener buen brillo en la pantalla para facilitar el escaneo." },
            { q: "¿Puedo transferir mi boleto a otra persona?", a: "Sí, los boletos digitales son transferibles. Sin embargo, recuerda que cada código QR es único y solo puede ser escaneado una vez en la entrada." }
        ]
    },
    {
        category: "Puntos de Venta Físicos",
        icon: Store,
        questions: [
            { q: "¿Dónde puedo comprar boletos en efectivo?", a: "Contamos con puntos de venta autorizados en: 1. Librería Jardín (Galerías Santo Domingo, Metrocentro y Multicentro Las Américas) y 2. Futbolero Barbershop (Plaza Inter)." },
            { q: "¿Los precios son los mismos en los puntos físicos?", a: "Sí, el precio del boleto es el mismo. Algunos puntos físicos podrían aplicar un cargo mínimo por servicio de impresión, pero el valor base del evento se mantiene." }
        ]
    },
    {
        category: "Cambios y Devoluciones",
        icon: Undo2,
        questions: [
            { q: "¿Qué pasa si un evento se cancela?", a: "En caso de cancelación oficial, MiBoletoNi notificará a todos los compradores y gestionará el reembolso total del valor del boleto según las políticas establecidas para dicho evento." },
            { q: "¿Puedo pedir un reembolso si no puedo asistir?", a: "Lamentablemente, como política general de boletería, no se realizan cambios ni devoluciones si el evento se lleva a cabo según lo programado, a menos que el organizador indique lo contrario." }
        ]
    }
];

export default function FAQPage() {
    const [searchTerm, setSearchTerm] = useState("");

    // Filtrado de preguntas en tiempo real
    const filteredFaqs = faqs.map(cat => ({
        ...cat,
        questions: cat.questions.filter(
            q => q.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 q.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(cat => cat.questions.length > 0);

    return (
        <div className="w-full min-h-screen bg-background flex flex-col items-center pb-20">
            
            {/* --- HERO / BUSCADOR --- */}
            <section className="w-full relative py-20 bg-primary/5 border-b flex justify-center overflow-hidden">
                {/* Decoración de fondo */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-primary/5 blur-[120px] rounded-full -z-10" />
                
                <div className="w-full max-w-4xl mx-auto text-center px-4 relative z-10">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20"
                    >
                        <HelpCircle className="w-8 h-8 text-primary" />
                    </motion.div>
                    
                    <h1 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-gray-900">
                        Centro de Ayuda
                    </h1>
                    
                    <div className="relative max-w-lg mx-auto shadow-2xl rounded-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input 
                            placeholder="Busca por 'pago', 'reembolso', 'puntos de venta'..." 
                            className="pl-12 h-14 rounded-full bg-background border-primary/20 text-lg focus-visible:ring-primary shadow-sm" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* --- LISTADO DE PREGUNTAS --- */}
            <div className="w-full max-w-4xl mx-auto px-4 py-12 md:py-20">
                <div className="grid gap-10">
                    <AnimatePresence mode='popLayout'>
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((category, index) => (
                                <motion.div 
                                    key={category.category} 
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-card rounded-3xl border border-muted-foreground/10 p-6 md:p-10 shadow-sm hover:shadow-md transition-shadow bg-white"
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-primary/10 rounded-2xl">
                                            <category.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h2 className="font-headline text-2xl font-bold text-gray-800">{category.category}</h2>
                                    </div>

                                    <Accordion type="single" collapsible className="w-full space-y-3">
                                        {category.questions.map((faq, qIndex) => (
                                            <AccordionItem 
                                                value={`item-${index}-${qIndex}`} 
                                                key={qIndex} 
                                                className="border border-muted/40 rounded-2xl px-2 overflow-hidden bg-muted/5"
                                            >
                                                <AccordionTrigger className="text-[17px] font-semibold text-left hover:text-primary py-4 px-4 hover:no-underline transition-all">
                                                    {faq.q}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-base text-muted-foreground px-4 pb-5 leading-relaxed">
                                                    {faq.a}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-bold">No encontramos resultados para tu búsqueda</h3>
                                <p className="text-muted-foreground">Intenta con otras palabras clave.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* --- FOOTER SOPORTE (Reutilizando tu estilo) --- */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-24 p-10 rounded-3xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10 text-center shadow-sm"
                >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="text-primary w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">¿Sigues con dudas?</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Nuestro equipo de soporte técnico está listo para ayudarte con cualquier inconveniente.
                    </p>
                    <Button asChild className="rounded-full px-12 py-7 text-lg shadow-lg hover:scale-105 transition-transform font-bold">
                        <Link href="/contact">Escríbenos ahora</Link>
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}