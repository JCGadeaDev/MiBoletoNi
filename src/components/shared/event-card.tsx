'use client';
import Image from 'next/image';
import Link from 'next/link';
import type { CombinedEvent } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Ticket } from 'lucide-react';

type EventCardProps = {
  event: CombinedEvent;
};

export function EventCard({ event }: EventCardProps) {
  // Fallback si no hay imagen
  const imageUrl = event.imageUrl || `https://picsum.photos/seed/${event.id}/600/400`;
  
  // Extraer día y mes para el Badge (Asumiendo formato texto o fecha simple)
  // Si tu fecha es "12 Octubre 2025", esto es solo visual.
  // Puedes ajustar la lógica según cómo venga tu string de fecha.
  const dateParts = event.date ? event.date.split(" ") : ["ND", ""];
  const day = dateParts[0] || "HOY"; 
  const month = dateParts[1] || "";

  return (
    <Card className="group h-full flex flex-col overflow-hidden border-border/50 bg-card transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-primary/50">
      <Link href={`/events/${event.id}`} className="flex flex-col h-full">
        
        {/* IMAGEN + BADGE DE FECHA */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={event.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
          
          {/* Overlay oscuro suave en la parte inferior de la imagen */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Badge de Fecha Flotante */}
          <div className="absolute top-3 right-3 bg-white/95 dark:bg-black/90 backdrop-blur-sm rounded-lg p-2 text-center shadow-lg min-w-[60px]">
            <span className="block text-xl font-bold text-primary leading-none">{day}</span>
            <span className="block text-xs font-bold text-muted-foreground uppercase">{month}</span>
          </div>

          {/* Categoría Badge */}
          <div className="absolute top-3 left-3">
             <span className="px-2 py-1 text-xs font-bold text-white bg-black/50 backdrop-blur-md rounded-full border border-white/20">
                {event.category || 'Evento'}
             </span>
          </div>
        </div>

        {/* CONTENIDO */}
        <CardContent className="flex flex-col flex-grow p-5">
          <h3 className="font-headline text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {event.name}
          </h3>
          
          {event.artist && (
            <p className="text-sm text-primary font-medium mb-3">
                {event.artist}
            </p>
          )}

          <div className="mt-auto space-y-3">
            {/* Ubicación */}
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="line-clamp-1">{event.venue || 'Ubicación por confirmar'}</span>
            </div>
            
            <div className="w-full h-px bg-border/50" />
            
            <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-muted-foreground">
                    Desde <span className="block text-lg font-bold text-foreground">$25.00</span>
                </div>
                <Button size="sm" className="rounded-full px-6 transition-all group-hover:bg-primary group-hover:text-white">
                    Comprar
                </Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}