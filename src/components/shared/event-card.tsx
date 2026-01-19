
'use client';
import Image from 'next/image';
import Link from 'next/link';
import type { Event } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '../ui/skeleton';

type EventCardProps = {
  event: Event;
};

export function EventCard({ event }: EventCardProps) {
  const imageUrl = event.imageUrl || `https://picsum.photos/seed/${event.id}/600/400`;
  const imageHint = "event photo";

  return (
    <Card className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl h-full flex flex-col">
      <Link href={`/events/${event.id}`} aria-label={event.name} className="flex flex-col flex-grow">
        <CardContent className="p-0 flex flex-col flex-grow">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={imageUrl}
              alt={event.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={imageHint}
              unoptimized
            />
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="font-headline text-lg font-semibold truncate">{event.name}</h3>
            {event.artist && <p className="text-sm text-muted-foreground">con {event.artist}</p>}
            
            <div className="mt-auto pt-4 flex items-center justify-between">
                <p className="text-lg font-bold text-primary">
                    <span className="text-xs font-normal text-muted-foreground">Desde </span>
                    Ver Precios
                </p>
                <Button size="sm" variant="secondary" asChild>
                    <span>Ver Fechas</span>
                </Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
