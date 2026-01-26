'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, ExternalLink } from "lucide-react";
import { motion, Variants } from "framer-motion"; // Importamos Variants
import { Button } from "@/components/ui/button";

const locations = [
    {
        name: "Librería Jardín",
        address: "Galerías Santo Domingo, Managua",
        hours: "Lunes a Domingo: 9:00 AM - 8:00 PM",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.0374744434224!2d-86.2239!3d12.1091!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA2JzMyLjgiTiA4NsKwMTMnMjYuMCJX!5e0!3m2!1ses!2sni!4v1634567890123"
    },
    {
        name: "Librería Jardín",
        address: "Centro Comercial Metrocentro, Managua",
        hours: "Lunes a Domingo: 9:00 AM - 8:00 PM",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.9!2d-86.26!3d12.12!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA3JzEwLjEiTiA4NsKwMTUnMzkuNiJX!5e0!3m2!1ses!2sni!4v1634567890124"
    },
    {
        name: "Librería Jardín",
        address: "Multicentro Las Américas, Managua",
        hours: "Lunes a Sábado: 9:00 AM - 7:00 PM",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.1!2d-86.23!3d12.14!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA4JzM0LjIiTiA4NsKwMTMnNDguMCJX!5e0!3m2!1ses!2sni!4v1634567890125"
    },
    {
        name: "Futbolero Barbershop",
        address: "Plaza Inter, Managua",
        hours: "Lunes a Sábado: 9:00 AM - 7:00 PM",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.8!2d-86.27!3d12.15!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA5JzAwLjAiTiA4NsKwMTYnMTIuMCJX!5e0!3m2!1ses!2sni!4v1634567890126"
    }
];

// --- SOLUCIÓN AL ERROR DE TIPO ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { 
            type: "spring", // Ahora TS sabe que esto es un literal permitido
            stiffness: 60 
        } 
    }
};

export default function PuntosDeVentaPage() {
    return (
        <div className="w-full min-h-screen bg-background flex flex-col items-center">
            
            <section className="w-full relative py-20 md:py-32 bg-primary/5 flex justify-center border-b overflow-hidden">
                <div className="w-full max-w-6xl mx-auto text-center px-4 relative z-10">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Ubicaciones Oficiales</span>
                        </div>
                        <h1 className="font-headline text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                            Nuestros Puntos de Venta
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
                            Visita nuestros socios autorizados en Managua para adquirir tus boletos.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="w-full max-w-6xl mx-auto px-4 py-16 md:py-24">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
                >
                    {locations.map((loc, idx) => (
                        <motion.div 
                            key={idx} 
                            variants={itemVariants}
                            className="group bg-card border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col"
                        >
                            <div className="h-56 bg-muted relative">
                                <iframe 
                                    src={loc.mapUrl} 
                                    className="w-full h-full border-0 grayscale group-hover:grayscale-0 transition-all duration-700" 
                                    allowFullScreen 
                                    loading="lazy" 
                                />
                                <div className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full">
                                    <MapPin className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="p-6 md:p-8 flex flex-col flex-grow space-y-4">
                                <h3 className="font-headline text-2xl font-bold group-hover:text-primary transition-colors">
                                    {loc.name}
                                </h3>
                                <p className="text-muted-foreground text-sm flex items-start gap-2">
                                    <MapPin className="w-4 h-4 mt-1 text-primary shrink-0" />
                                    {loc.address}
                                </p>

                                <div className="pt-4 border-t border-muted flex flex-col gap-3 mt-auto">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <span>{loc.hours}</span>
                                    </div>
                                    <Button asChild variant="outline" size="sm" className="w-fit rounded-full">
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-4 h-4 mr-2" /> Cómo llegar
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-center mt-20 p-8 rounded-3xl bg-muted/30 border border-dashed border-muted-foreground/30 max-w-3xl mx-auto"
                >
                    <h3 className="text-2xl font-bold mb-3">¿Tienes un negocio?</h3>
                    <p className="text-muted-foreground mb-8 text-sm">
                        Únete a nuestra red de puntos de venta autorizados.
                    </p>
                    
                    <Button asChild className="rounded-full px-10 py-6 text-lg shadow-lg">
                        <Link href="/contact">
                            Aplicar como Punto de Venta
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}