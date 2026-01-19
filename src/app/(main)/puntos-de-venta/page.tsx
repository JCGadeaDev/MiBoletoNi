'use client';

import { PlaceHolderImages } from "@/lib/placeholder-images";
import { MapPin, Clock, ExternalLink } from "lucide-react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";


const locations = [
    {
        name: "Librería Jardín",
        address: "Galerías Santo Domingo, Managua",
        hours: "Lunes a Domingo: 9:00 AM - 8:00 PM",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.726202422588!2d-86.2536!3d12.1305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA3JzQ5LjgiTiA4NsKwMTUnMTMuMCJX!5e0!3m2!1ses!2sni!4v1620000000000!5m2!1ses!2sni" // Ejemplo real o placeholder funcional
    },
    {
        name: "Librería Jardín",
        address: "Centro Comercial Metrocentro, Managua",
        hours: "Lunes a Domingo: 9:00 AM - 8:00 PM",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.726202422588!2d-86.2700!3d12.1280!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA3JzQwLjgiTiA4NsKwMTYnMTIuMCJX!5e0!3m2!1ses!2sni!4v1620000000000!5m2!1ses!2sni"
    },
    {
        name: "Librería Jardín",
        address: "Multicentro Las Américas, Managua",
        hours: "Lunes a Sábado: 9:00 AM - 7:00 PM",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.726202422588!2d-86.2300!3d12.1400!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA4JzI0LjAiTiA4NsKwMTMnNDguMCJX!5e0!3m2!1ses!2sni!4v1620000000000!5m2!1ses!2sni"
    },
    {
        name: "Futbolero Barbershop",
        address: "Plaza Inter, Managua",
        hours: "Lunes a Sábado: 9:00 AM - 7:00 PM",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.726202422588!2d-86.2900!3d12.1500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA5JzAwLjAiTiA4NsKwMTcnMjQuMCJX!5e0!3m2!1ses!2sni!4v1620000000000!5m2!1ses!2sni"
    }
]

const mapImage = PlaceHolderImages.find(p => p.id === 'map-background');

// Variantes para animación staggered (escalonada)
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 50 } 
  }
};

export default function PuntosDeVentaPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {mapImage && (
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <Image 
              src={mapImage.imageUrl}
              alt={mapImage.description}
              fill
              className="object-cover opacity-30 dark:opacity-20"
              data-ai-hint={mapImage.imageHint}
            />
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
        
        <div className="container relative text-center z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Ubicaciones Oficiales</span>
                </div>
                <h1 className="font-headline text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                Nuestros Puntos de Venta
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                ¿Prefieres comprar en persona? Visita nuestros socios autorizados para adquirir o canjear tus boletos físicos.
                </p>
            </motion.div>
        </div>
      </section>

      {/* Lista de Ubicaciones */}
      <div className="container pb-20">
        <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {locations.map((location, idx) => (
              <motion.div variants={item} key={idx} className="group relative">
                  {/* Card Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl opacity-0 group-hover:opacity-75 blur transition duration-500"></div>
                  
                  <div className="relative bg-card border rounded-2xl overflow-hidden shadow-lg h-full flex flex-col">
                      <div className="h-48 w-full relative bg-muted">
                        <iframe
                            className="w-full h-full border-0 filter grayscale hover:grayscale-0 transition-all duration-500"
                            loading="lazy"
                            allowFullScreen
                            src={location.mapUrl}
                        />
                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
                            <MapPin className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="font-headline text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                            {location.name}
                        </h3>
                        <p className="text-muted-foreground mb-4 flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                            {location.address}
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="text-muted-foreground text-xs">{location.hours}</span>
                            </div>
                        </div>
                      </div>
                  </div>
              </motion.div>
          ))}
        </motion.div>
        
        {/* Call to action footer */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mt-16 p-8 rounded-2xl bg-muted/30 border border-dashed border-muted-foreground/30 max-w-3xl mx-auto"
        >
            <h3 className="text-xl font-bold mb-2">¿Tienes un negocio?</h3>
            <p className="text-muted-foreground mb-4">Conviértete en un punto de venta autorizado de MiBoletoNi y aumenta el tráfico de clientes en tu local.</p>
            <Button variant="outline">Aplicar como Punto de Venta</Button>
        </motion.div>
      </div>
    </div>
  );
}