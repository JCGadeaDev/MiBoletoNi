

import { PlaceHolderImages } from "@/lib/placeholder-images";
import { MapPin } from "lucide-react";
import Image from "next/image";

const locations = [
    {
        name: "Librería Jardín",
        address: "Galerías Santo Domingo, Managua",
        hours: "Lunes a Domingo: 9:00 AM - 8:00 PM",
        mapUrl: "https://maps.google.com/maps?q=Galer%C3%ADas%20Santo%20Domingo%2C%20Managua&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        name: "Libreria Jardín",
        address: "Centro Comercial Metrocentro, Managua",
        hours: "Lunes a Domingo: 9:00 AM - 8:00 PM",
        mapUrl: "https://maps.google.com/maps?q=Centro%20Comercial%20Metrocentro%2C%20Managua&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        name: "Libreria Jardín",
        address: "Centro Comercial Multicentro Las Américas, Managua",
        hours: "Lunes a Sábado: 9:00 AM - 7:00 PM",
        mapUrl: "https://maps.google.com/maps?q=Centro%20Comercial%20Multicentro%20Las%20Am%C3%A9ricas%2C%20Managua&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
        name: "Futbolero Barbershop",
        address: "Plaza Inter, Managua",
        hours: "Lunes a Sábado: 9:00 AM - 7:00 PM",
        mapUrl: "https://maps.google.com/maps?q=Plaza%20Inter%2C%20Managua&t=&z=15&ie=UTF8&iwloc=&output=embed"
    }
]

const mapImage = PlaceHolderImages.find(p => p.id === 'map-background');

export default function PuntosDeVentaPage() {
  return (
    <>
      <section className="relative py-20 md:py-28 bg-secondary">
        {mapImage && (
          <Image 
            src={mapImage.imageUrl}
            alt={mapImage.description}
            fill
            className="object-cover"
            data-ai-hint={mapImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-black/30" />
        <div className="container relative text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">
            Nuestros Puntos de Venta
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
            Encuentra la ubicación más cercana para comprar o canjear tus boletos en persona.
            </p>
        </div>
      </section>
      <div className="container py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {locations.map((location) => (
              <div key={`${location.name}-${location.address}`} className="bg-card border rounded-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
                  <div className="p-6 text-center">
                    <MapPin className="h-10 w-10 text-primary mb-4 mx-auto transition-colors group-hover:text-primary-foreground" />
                    <h3 className="font-headline text-xl font-semibold mb-2 transition-colors group-hover:text-primary-foreground">{location.name}</h3>
                    <p className="text-muted-foreground transition-colors group-hover:text-primary-foreground/80">{location.address}</p>
                    <p className="text-sm text-muted-foreground mt-2 transition-colors group-hover:text-primary-foreground/80">{location.hours}</p>
                  </div>
                  <div className="w-full h-48 mt-auto">
                    <iframe
                        className="w-full h-full border-0"
                        loading="lazy"
                        allowFullScreen
                        src={location.mapUrl}>
                    </iframe>
                  </div>
              </div>
          ))}
        </div>
      </div>
    </>
  );
}
