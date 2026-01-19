'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ScrollText, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsPage() {
  const lastUpdated = "19 de enero, 2026";

  return (
    <div className="min-h-screen bg-background py-16 md:py-24 relative overflow-hidden">
      {/* Fondo decorativo sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="container max-w-4xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <Card className="shadow-2xl border-none ring-1 ring-border/50">
                {/* Header */}
                <div className="text-center pt-12 pb-8 px-6 border-b bg-muted/20">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-inner">
                        <ScrollText className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="font-headline text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Términos y Condiciones
                    </h1>
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                        <CalendarDays className="w-4 h-4" />
                        <span>Última actualización: {lastUpdated}</span>
                    </div>
                </div>

                <CardContent className="p-8 md:p-16">
                    <article className="prose prose-slate dark:prose-invert max-w-none 
                        prose-headings:font-headline prose-headings:font-bold prose-headings:text-foreground
                        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b
                        prose-p:text-muted-foreground prose-p:leading-loose prose-p:text-lg
                        prose-strong:text-primary prose-strong:font-semibold
                        prose-li:text-muted-foreground">
                        
                        <p className="lead text-xl font-medium text-foreground">
                            Bienvenido a <span className="text-primary font-bold">MiBoletoNi</span>. Al utilizar nuestra plataforma, aceptas las reglas del juego que detallamos a continuación.
                        </p>

                        <h2>1. Definiciones Clave</h2>
                        <ul>
                            <li><strong>Plataforma:</strong> El sitio web y sistema tecnológico de MiBoletoNi.</li>
                            <li><strong>Usuario:</strong> Tú, el fan que compra boletos.</li>
                            <li><strong>Organizador:</strong> La empresa que produce el concierto o evento.</li>
                            <li><strong>Boleto:</strong> Tu llave de acceso (digital o física).</li>
                        </ul>

                        <h2>2. Nuestro Rol (Intermediario)</h2>
                        <p>
                            Piensa en nosotros como el puente. <strong>MiBoletoNi</strong> facilita la tecnología para que compres tu entrada, pero no somos quienes organizan el concierto, ni decidimos los precios, ni controlamos el sonido del evento. Nuestra misión es asegurar que tu boleto llegue a tus manos (o email) de forma segura.
                        </p>

                        <h2>3. Tu Compra es Final</h2>
                        <p>
                            Al igual que en la mayoría de boleteras del mundo, <strong>todas las ventas son finales</strong>. Por favor, revisa bien la fecha y hora antes de pagar. No podemos hacer cambios ni devoluciones si cambias de opinión o si te surge otro compromiso.
                        </p>
                        
                        <h2>4. Cancelaciones y Reembolsos</h2>
                        <p>
                            Si el evento se cancela (¡toco madera!), no te preocupes. <strong>MiBoletoNi</strong> gestionará el reembolso siguiendo las instrucciones del Organizador. Generalmente se devuelve el valor del boleto (el cargo por servicio no suele ser reembolsable ya que cubre la transacción bancaria y el uso de la plataforma).
                        </p>

                        <h2>5. Cuida tu Boleto</h2>
                        <p>
                            Tu código QR es único. Si lo compartes en redes sociales y alguien más lo escanea antes que tú, no podrás entrar. <strong>Eres responsable de la custodia de tu entrada.</strong>
                        </p>

                        <h2>6. Ley Aplicable</h2>
                        <p>
                            Todo lo anterior se rige bajo las leyes de la <strong>República de Nicaragua</strong>. Cualquier disputa legal se resolverá en los tribunales de Managua.
                        </p>

                        <div className="mt-12 p-6 bg-primary/5 rounded-xl border border-primary/10 text-center">
                            <p className="text-sm m-0">
                                ¿Tienes dudas sobre estos términos? Escríbenos a <a href="mailto:info@miboletoni.com" className="text-primary font-bold no-underline hover:underline">info@miboletoni.com</a>
                            </p>
                        </div>
                    </article>
                </CardContent>
            </Card>
        </motion.div>
      </div>
    </div>
  );
}