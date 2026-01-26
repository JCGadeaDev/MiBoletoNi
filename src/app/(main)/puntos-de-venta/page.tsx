'use client';

import React from 'react';
import { MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const locations = [
    { name: "Librería Jardín", address: "Galerías Santo Domingo, Managua", hours: "9:00 AM - 8:00 PM", mapUrl: "https://www.google.com/maps/embed?..." },
    { name: "Futbolero Barbershop", address: "Plaza Inter, Managua", hours: "9:00 AM - 7:00 PM", mapUrl: "https://www.google.com/maps/embed?..." }
];

export default function PuntosDeVentaPage() {
  return (
    <div className="w-full min-h-screen bg-background flex flex-col items-center">
      <section className="w-full relative py-24 bg-primary/5 flex justify-center border-b">
        <div className="w-full max-w-6xl mx-auto text-center px-4 relative z-10">
            <h1 className="font-headline text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                Puntos de Venta
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Ubicaciones oficiales para comprar tus boletos en físico.</p>
        </div>
      </section>

      <div className="w-full max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {locations.map((loc, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-card border rounded-2xl overflow-hidden shadow-lg flex flex-col"
              >
                  <div className="h-48 bg-muted relative">
                      <iframe src={loc.mapUrl} className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all" />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                      <h3 className="font-headline text-2xl font-bold mb-2">{loc.name}</h3>
                      <p className="text-muted-foreground flex items-start gap-2 mb-4"><MapPin className="w-4 h-4 mt-1" /> {loc.address}</p>
                      <div className="mt-auto flex items-center gap-2 text-sm text-primary font-medium">
                          <Clock className="w-4 h-4" /> <span>{loc.hours}</span>
                      </div>
                  </div>
              </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}