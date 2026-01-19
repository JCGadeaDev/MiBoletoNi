'use client';

import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, CalendarClock } from "lucide-react";

export default function PrivacyPage() {
  const lastUpdated = "19 de enero 2026";

  return (
    <div className="min-h-screen bg-muted/20 py-16 md:py-24">
      <div className="container max-w-4xl mx-auto">
        
        {/* Header Limpio */}
        <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4">Política de Privacidad</h1>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-background px-3 py-1 rounded-full border shadow-sm">
                <CalendarClock className="w-4 h-4" />
                Actualizado: {lastUpdated}
            </div>
        </div>

        {/* Contenido Legible */}
        <Card className="shadow-lg border-muted/60">
          <CardContent className="p-8 md:p-12">
            <div className="prose prose-purple dark:prose-invert max-w-none 
                prose-headings:font-headline prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground">
              
              <p className="lead text-xl text-foreground font-medium">
                En MiBoletoNi, la privacidad y seguridad de tus datos personales es nuestra máxima prioridad.
              </p>

              <hr className="my-8 border-border" />

              <h2>1. ¿Quién es el Responsable?</h2>
              <ul>
                <li><strong>Razón Social:</strong> MiBoletoNi S.A.</li>
                <li><strong>Domicilio:</strong> Managua, Nicaragua</li>
                <li><strong>Contacto:</strong> <a href="mailto:privacidad@miboletoni.com" className="text-primary hover:underline">privacidad@miboletoni.com</a></li>
              </ul>

              {/* ... Resto del contenido igual, solo cambia las etiquetas HTML por el texto que ya tenías ... */}
              
              <div className="bg-primary/5 p-6 rounded-xl mt-8 border border-primary/10">
                <h3 className="text-primary mt-0">Tus Derechos</h3>
                <p className="mb-0">
                    Tienes control total. Si deseas acceder, rectificar o eliminar tus datos, simplemente escríbenos.
                </p>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}