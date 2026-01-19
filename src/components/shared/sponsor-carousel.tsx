'use client';

import Image from 'next/image';

// Example logos, replace with real data from your bucket
const logos = [
  { src: '/sponsors/logo1.svg', alt: 'Sponsor 1' },
  { src: '/sponsors/logo2.svg', alt: 'Sponsor 2' },
  { src: '/sponsors/logo3.svg', alt: 'Sponsor 3' },
  { src: '/sponsors/logo4.svg', alt: 'Sponsor 4' },
  { src: '/sponsors/logo5.svg', alt: 'Sponsor 5' },
  { src: '/sponsors/logo6.svg', alt: 'Sponsor 6' },
];

export function SponsorCarousel() {
  const duplicatedLogos = [...logos, ...logos, ...logos, ...logos];
  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex w-max animate-scroll">
        {duplicatedLogos.map((logo, index) => (
          <div key={index} className="flex-shrink-0 w-[500px] h-[250px] flex items-center justify-center p-8">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={400}
              height={200}
              className="max-h-[200px] w-auto object-contain"
            />
          </div>
        ))}
      </div>
       <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-secondary/50 to-transparent pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-secondary/50 to-transparent pointer-events-none"></div>
    </div>
  );
}
