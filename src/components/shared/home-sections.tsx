'use client';

import { ShieldCheck, Ticket, Users, CheckCircle2, Star, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// --- SECCIÓN SOBRE NOSOTROS (AboutSection) ---
export const AboutSection = () => {
    return (
        <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-card border border-muted/50 shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-0">
                
                {/* COLUMNA DE TEXTO */}
                <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 lg:order-1">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 w-fit">
                            <Star className="w-4 h-4" />
                            Sobre Nosotros
                        </div>
                        
                        <h2 className="font-headline text-3xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
                            La plataforma #1 de <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                                eventos en Nicaragua
                            </span>
                        </h2>
                        
                        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                            <p>
                                Somos la plataforma líder en Nicaragua para la compra de boletos para los mejores eventos: 
                                <span className="text-foreground font-medium"> conciertos, teatro, deportes y mucho más.</span>
                            </p>
                            <p>
                                Nuestra misión es conectar a las personas con sus pasiones, ofreciendo una experiencia de compra 
                                fácil, rápida y 100% segura.
                            </p>
                        </div>

                        {/* Pequeña lista de beneficios visuales */}
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                            {['Compra en 3 clics', 'Pagos Encriptados', 'Entradas QR', 'Soporte 24/7'].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    {item}
                                </div>
                            ))}
                        </div>

                        <Button asChild size="lg" className="group w-fit rounded-full px-8">
                            <Link href="/about">
                                Conoce nuestra historia 
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                {/* COLUMNA DE IMAGEN */}
                <div className="relative h-[300px] lg:h-auto order-1 lg:order-2 overflow-hidden min-h-[400px]">
                    <motion.div 
                        className="absolute inset-0"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Imagen de Alta Calidad (Concierto) */}
                        <Image
                            src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1974&auto=format&fit=crop"
                            alt="Experiencia en concierto"
                            fill
                            className="object-cover"
                            priority
                        />
                        
                        {/* Overlay Gradiente para mejorar lectura si hubiera texto encima, y estética */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:bg-gradient-to-l lg:from-black/20" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};


// --- SECCIÓN POR QUÉ ELEGIRNOS (WhyUsSection) ---
export const WhyUsSection = () => {
    const features = [
        {
            icon: ShieldCheck,
            title: "Compra Blindada",
            description: "Tu seguridad es primero. Utilizamos encriptación bancaria para proteger cada transacción.",
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            icon: Ticket,
            title: "Entrega Inmediata",
            description: "Sin filas, sin esperas. Recibe tus boletos QR en tu correo segundos después de pagar.",
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-900/20"
        },
        {
            icon: Users,
            title: "Soporte Humano",
            description: "Nada de robots. Nuestro equipo local está listo para resolver tus dudas por WhatsApp o correo.",
            color: "text-pink-500",
            bg: "bg-pink-50 dark:bg-pink-900/20"
        },
    ];

    // Variantes para animación en cascada
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <section className="py-8 md:py-16">
            <div className="text-center mb-16">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="font-headline text-3xl md:text-5xl font-bold mb-4"
                >
                    ¿Por Qué Elegir MiBoletoNi?
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-muted-foreground text-lg max-w-2xl mx-auto"
                >
                    Diseñamos una experiencia pensada en tu tranquilidad y disfrute.
                </motion.p>
            </div>

            <motion.div 
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid md:grid-cols-3 gap-8"
            >
                {features.map((feature, index) => (
                    <motion.div 
                        key={index} 
                        variants={item}
                        whileHover={{ y: -10 }}
                        className="relative p-8 bg-card rounded-2xl shadow-lg border border-transparent hover:border-primary/20 transition-all duration-300 group"
                    >
                        {/* Icono con fondo de color */}
                        <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            <feature.icon className={`h-8 w-8 ${feature.color}`} />
                        </div>

                        <h3 className="font-headline text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                            {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};