'use client';

import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { motion } from "framer-motion";
import { Search, HelpCircle, CreditCard, Ticket, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const faqs = [
    {
        category: "Proceso de Compra",
        icon: CreditCard,
        questions: [
            { q: "¿Cómo compro boletos en MiBoletoNi?", a: "¡Es muy fácil! 1. Elige tu evento. 2. Selecciona la cantidad. 3. Paga seguro. 4. Recibe tus boletos por email." },
            { q: "¿Qué métodos de pago aceptan?", a: "Aceptamos tarjetas de crédito y débito (Visa, MasterCard) a través de nuestra pasarela segura." }
        ]
    },
    {
        category: "Mis Boletos",
        icon: Ticket,
        questions: [
            { q: "No he recibido mis boletos", a: "Revisa SPAM. Si no están, inicia sesión y descarga desde 'Mis Eventos'." }
        ]
    }
];

export default function FAQPage() {
  return (
    <div className="w-full min-h-screen bg-background flex flex-col items-center">
      <section className="w-full relative py-20 bg-primary/5 border-b flex justify-center">
        <div className="w-full max-w-4xl mx-auto text-center px-4 relative z-10">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-6">¿Cómo podemos ayudarte?</h1>
            <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input placeholder="Buscar respuesta..." className="pl-10 h-12 rounded-full bg-background border-primary/20" />
            </div>
        </div>
      </section>

      <div className="w-full max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-12">
          {faqs.map((category, index) => (
            <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                className="bg-card rounded-2xl border p-6 md:p-8 shadow-sm"
            >
                <div className="flex items-center gap-4 mb-6">
                    <category.icon className="w-6 h-6 text-primary" />
                    <h2 className="font-headline text-2xl font-bold">{category.category}</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, qIndex) => (
                        <AccordionItem value={`item-${index}-${qIndex}`} key={qIndex} className="border-b-0 mb-2">
                            <AccordionTrigger className="text-lg text-left hover:text-primary px-4 py-3 rounded-lg hover:bg-muted/50">{faq.q}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground px-4 pb-4">{faq.a}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}