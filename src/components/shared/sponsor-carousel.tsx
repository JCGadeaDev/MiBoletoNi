'use client';

import Image from 'next/image';

// Logos de ejemplo (Usando placeholders de texto si no tienes SVGs reales aún)
const logos = [
  { src: 'https://via.placeholder.com/150x50?text=Logo+1', alt: 'Sponsor 1' },
  { src: 'https://via.placeholder.com/150x50?text=Logo+2', alt: 'Sponsor 2' },
  { src: 'https://via.placeholder.com/150x50?text=Logo+3', alt: 'Sponsor 3' },
  { src: 'https://via.placeholder.com/150x50?text=Logo+4', alt: 'Sponsor 4' },
  { src: 'https://via.placeholder.com/150x50?text=Logo+5', alt: 'Sponsor 5' },
  { src: 'https://via.placeholder.com/150x50?text=Logo+6', alt: 'Sponsor 6' },
];

export function SponsorCarousel() {
  // Triplicamos la lista para asegurar un loop infinito suave
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div className="w-full py-10 bg-background/50 border-y border-border/50 backdrop-blur-sm">
        <div className="container px-4">
            <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">
                Confían en nosotros
            </p>
            
            <div className="relative w-full overflow-hidden">
                {/* Máscara de gradiente para desvanecer los bordes */}
                <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-background via-transparent to-background"></div>

                <div className="flex w-max animate-scroll gap-12 md:gap-24 items-center">
                    {duplicatedLogos.map((logo, index) => (
                        <div 
                            key={index} 
                            className="relative flex-shrink-0 w-[120px] md:w-[160px] h-[60px] flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                        >
                            <Image
                                src={logo.src} // Asegúrate de poner tus rutas reales aquí '/sponsors/logo1.svg'
                                alt={logo.alt}
                                width={160}
                                height={60}
                                className="object-contain w-full h-full"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}