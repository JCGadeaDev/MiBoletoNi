'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, HelpCircle, CreditCard, Ticket, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const faqs = [
    {
        category: "Proceso de Compra",
        icon: CreditCard,
        questions: [
            {
                q: "¿Cómo compro boletos en MiBoletoNi?",
                a: "¡Es muy fácil! 1. Elige tu evento. 2. Selecciona la cantidad y tipo de boletos. 3. Haz clic en \"Comprar Boletos\" y sigue los pasos para el pago seguro. 4. ¡Listo! Recibirás tus boletos en tu correo electrónico."
            },
            {
                q: "¿Qué métodos de pago aceptan?",
                a: "Aceptamos las principales tarjetas de crédito y débito (Visa, MasterCard) a través de nuestra pasarela de pago 100% segura. También estamos trabajando para integrar pagos locales pronto."
            },
            {
                q: "¿El precio incluye impuestos?",
                a: "Sí, transparencia total. El precio final que ves antes de pagar siempre incluye todos los impuestos y cargos por servicio aplicables. No hay sorpresas ocultas."
            }
        ]
    },
    {
        category: "Mis Boletos y Acceso",
        icon: Ticket,
        questions: [
            {
                q: "No he recibido el correo con mis boletos",
                a: "Primero, revisa tu carpeta de SPAM. Si no están allí, inicia sesión en tu cuenta de MiBoletoNi, ve a \"Mis Eventos\" y podrás descargarlos directamente. ¿Aún nada? Contáctanos."
            },
            {
                q: "¿Tengo que imprimir mis boletos?",
                a: "Depende del evento. Generalmente basta con mostrar el QR en tu celular. Sin embargo, algunos eventos específicos requieren canje por boleto físico. Esto estará claramente indicado en la página del evento."
            },
            {
                q: "¿Podemos entrar por separado si compré varios boletos?",
                a: "¡Claro! Cada boleto es único. Puedes enviar el PDF o QR correspondiente a cada amigo y ellos podrán ingresar por su cuenta."
            }
        ]
    },
    {
        category: "Cancelaciones",
        icon: AlertCircle,
        questions: [
            {
                q: "¿Puedo pedir un reembolso?",
                a: "Como norma general en la industria, todas las ventas son finales. Sin embargo, si un evento se cancela definitivamente, se activará el protocolo de reembolso automático."
            },
            {
                q: "¿Qué pasa si el evento se pospone?",
                a: "Si el evento cambia de fecha, tus boletos siguen siendo válidos para la nueva fecha automáticamente. Si no puedes asistir a la nueva fecha, deberás gestionar la transferencia de tus boletos."
            }
        ]
    }
]

const heroImage = PlaceHolderImages.find(p => p.id === 'faq-hero');

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Moderno */}
      <section className="relative py-20 bg-primary/5 border-b">
        <div className="container relative z-10">
            <div className="max-w-2xl mx-auto text-center space-y-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3"
                >
                    <HelpCircle className="w-8 h-8 text-primary" />
                </motion.div>
                
                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="font-headline text-4xl md:text-5xl font-bold"
                >
                    ¿Cómo podemos ayudarte?
                </motion.h1>
                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-muted-foreground"
                >
                    Busca respuestas rápidas sobre compras, boletos y más.
                </motion.p>

                {/* Buscador Visual */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative max-w-md mx-auto"
                >
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input 
                        placeholder="Buscar una pregunta (ej. reembolso, ubicación...)" 
                        className="pl-10 h-12 rounded-full shadow-sm bg-background border-primary/20 focus-visible:ring-primary"
                    />
                </motion.div>
            </div>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>
      </section>

      <div className="container py-16 md:py-24">
        <div className="max-w-4xl mx-auto grid gap-12">
          {faqs.map((category, index) => (
            <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl border p-6 md:p-8 shadow-sm"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <category.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="font-headline text-2xl font-bold">{category.category}</h2>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, qIndex) => (
                        <AccordionItem value={`item-${index}-${qIndex}`} key={qIndex} className="border-b-0 mb-4 last:mb-0">
                            <AccordionTrigger className="text-lg text-left font-medium hover:text-primary transition-colors px-4 py-4 rounded-lg hover:bg-muted/50 data-[state=open]:bg-muted/50 data-[state=open]:text-primary">
                                {faq.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground px-4 py-2 leading-relaxed">
                                {faq.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </motion.div>
          ))}
        </div>
        
        {/* Footer de ayuda */}
        <div className="text-center mt-20">
            <p className="text-muted-foreground mb-4">¿No encontraste lo que buscabas?</p>
            <Button variant="default" className="rounded-full px-8">Contáctanos</Button>
        </div>
      </div>
    </div>
  );
}