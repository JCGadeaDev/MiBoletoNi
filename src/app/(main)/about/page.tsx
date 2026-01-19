'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Target, Eye, HeartHandshake, Ticket, Users, Zap } from 'lucide-react';

// Imágenes de demostración de Unsplash con temática de eventos/morado para encajar con tu marca
const heroImage = "https://images.unsplash.com/photo-1459749411177-047381bb908a?q=80&w=2070&auto=format&fit=crop";
const sideImage1 = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop";
const sideImage2 = "https://images.unsplash.com/photo-1514525253440-b393452e8d2e?q=80&w=1974&auto=format&fit=crop";

const values = [
    {
        title: 'Nuestra Misión',
        description: 'Facilitar el acceso a eventos artísticos, culturales y deportivos en Nicaragua, conectando a las personas con sus experiencias favoritas de una manera fácil, rápida y segura.',
        icon: Target,
    },
    {
        title: 'Nuestra Visión',
        description: 'Ser la plataforma líder y de mayor confianza para la compra y venta de boletos en Nicaragua, impulsando el crecimiento de la industria del entretenimiento local.',
        icon: Eye,
    },
    {
        title: 'Nuestro Compromiso',
        description: 'Ofrecer una experiencia de usuario excepcional, brindar soporte cercano a nuestros clientes y ser el mejor aliado para los organizadores de eventos.',
        icon: HeartHandshake,
    },
];

const stats = [
    { label: "Eventos Gestionados", value: "+500", icon: Ticket },
    { label: "Usuarios Felices", value: "+10k", icon: Users },
    { label: "Procesamiento", value: "Flash", icon: Zap },
];

export default function AboutPage() {
  return (
    <div className="overflow-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Imagen de fondo con Parallax suave */}
        <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 z-0"
        >
            <Image 
                src={heroImage}
                alt="Concierto vibrante"
                fill
                className="object-cover"
                priority
            />
        </motion.div>
        
        {/* Overlay con el degradado de tu marca (Morado a Negro) */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-purple-900/60 to-black/40 z-10" />

        {/* Contenido Hero */}
        <div className="container relative z-20 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-4">
              La Boletería de Nicaragua
            </span>
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-white drop-shadow-lg tracking-tight">
              Conectando <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Pasiones</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-200 leading-relaxed">
              Somos el puente hacia tus próximas experiencias inolvidables. Tecnología, seguridad y emoción en un solo lugar.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* --- SECCIÓN ESENCIA --- */}
      <section className="py-20 md:py-32 bg-background relative">
        {/* Elementos decorativos de fondo (Blobs) */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />

        <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Texto */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                >
                    <div>
                        <h2 className="font-headline text-3xl md:text-5xl font-bold text-foreground">
                            Nuestra Esencia
                        </h2>
                        <div className="h-1 w-20 bg-purple-600 mt-4 rounded-full" />
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Nacimos de la pasión por la música en vivo, el teatro y la emoción del deporte. Entendemos lo que significa contar los días para un evento, y nuestra misión es hacer que ese viaje comience con una compra simple y segura.
                    </p>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        En <span className="font-bold text-purple-600">MiBoletoNi</span>, no solo vendemos entradas; entregamos la llave a momentos que durarán para siempre.
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 pt-4">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="text-center p-4 bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <stat.icon className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                                <div className="font-bold text-xl md:text-2xl">{stat.value}</div>
                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Collage de Imágenes */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative h-[500px] w-full hidden md:block"
                >
                    <div className="absolute top-0 right-0 w-2/3 h-2/3 rounded-2xl overflow-hidden shadow-2xl border-4 border-background z-10 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Image src={sideImage1} alt="Evento" fill className="object-cover" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-2/3 h-2/3 rounded-2xl overflow-hidden shadow-2xl border-4 border-background z-20 -rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Image src={sideImage2} alt="Público feliz" fill className="object-cover" />
                    </div>
                    {/* Badge decorativo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-purple-600 text-white w-24 h-24 rounded-full flex items-center justify-center font-bold text-center p-2 shadow-lg animate-pulse">
                        Vive la Magia
                    </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* --- SECCIÓN VALORES (TARJETAS) --- */}
      <section className="py-20 bg-muted/30">
        <div className="container">
            <div className="text-center mb-16 max-w-2xl mx-auto">
                <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">Lo que nos mueve</h2>
                <p className="text-muted-foreground">Nuestros pilares fundamentales para brindarte el mejor servicio en Nicaragua.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {values.map((value, index) => (
                    <motion.div
                        key={value.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2, duration: 0.5 }}
                        className="bg-card p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border group"
                    >
                        <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                            <value.icon className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h3 className="font-headline text-2xl font-bold mb-4 text-foreground">{value.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {value.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}