'use client';

import { ShieldCheck, Ticket, Users } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const aboutImage = PlaceHolderImages.find(p => p.id === 'event-5');

// --- Componentes de la página de inicio ---

export const AboutSection = () => {
    return (
        <section className="bg-card p-8 rounded-2xl shadow-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                    <h2 className="font-headline text-3xl font-bold mb-4">Sobre MiBoletoNi</h2>
                    <p className="text-muted-foreground mb-4">
                        Somos la plataforma líder en Nicaragua para la compra de boletos para los mejores eventos: conciertos, teatro, deportes y mucho más. Nuestra misión es conectar a las personas con sus pasiones, ofreciendo una experiencia de compra fácil, rápida y 100% segura.
                    </p>
                    <Button asChild>
                        <Link href="/about">Conoce más de nuestra historia</Link>
                    </Button>
                </div>
                {aboutImage && (
                    <div className="relative h-64 w-full rounded-lg overflow-hidden">
                        <Image
                            src={aboutImage.imageUrl}
                            alt={aboutImage.description}
                            fill
                            className="object-cover"
                            data-ai-hint={aboutImage.imageHint}
                        />
                    </div>
                )}
            </div>
        </section>
    );
};

export const WhyUsSection = () => {
    const features = [
        {
            icon: <ShieldCheck className="h-10 w-10 text-primary mb-4" />,
            title: "Compra Segura",
            description: "Utilizamos los más altos estándares de seguridad para proteger tu información en cada transacción.",
        },
        {
            icon: <Ticket className="h-10 w-10 text-primary mb-4" />,
            title: "Acceso Instantáneo",
            description: "Recibe tus boletos digitales al instante en tu correo y accede a ellos desde tu cuenta en cualquier momento.",
        },
        {
            icon: <Users className="h-10 w-10 text-primary mb-4" />,
            title: "Soporte Dedicado",
            description: "Nuestro equipo de atención al cliente está listo para ayudarte con cualquier duda sobre tu compra.",
        },
    ];

    return (
        <section className="py-16">
            <div className="text-center">
                <h2 className="font-headline text-3xl font-bold mb-4">¿Por Qué Elegir MiBoletoNi?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
                    Tu tranquilidad y disfrute son nuestra prioridad.
                </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <div key={index} className="text-center p-6 bg-card rounded-2xl shadow border border-transparent hover:border-primary transition-colors duration-300">
                        {feature.icon}
                        <h3 className="font-headline text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};
