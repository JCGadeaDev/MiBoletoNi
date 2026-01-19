'use client';

import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, CalendarClock } from "lucide-react";

export default function PrivacyPage() {
  const lastUpdated = "19 de enero, 2026";

  return (
    <div className="min-h-screen bg-muted/20 py-16 md:py-24">
      <div className="container max-w-4xl mx-auto">
        
        {/* --- HEADER --- */}
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

        {/* --- CONTENIDO --- */}
        <Card className="shadow-lg border-muted/60">
          <CardContent className="p-8 md:p-12">
            <div className="prose prose-purple dark:prose-invert max-w-none 
                prose-headings:font-headline prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-li:marker:text-primary">
              
              <p className="lead text-xl text-foreground font-medium">
                En MiBoletoNi, la privacidad y seguridad de tus datos personales es nuestra máxima prioridad. Esta política describe cómo recopilamos, usamos y protegemos la información que nos proporcionas.
              </p>

              <hr className="my-8 border-border" />

              {/* SECCIÓN 1 */}
              <h2>1. ¿Quién es el Responsable de tus Datos?</h2>
              <ul>
                <li><strong>Razón Social:</strong> MiBoletoNi S.A.</li>
                <li><strong>Domicilio:</strong> Managua, Nicaragua</li>
                <li><strong>Email de contacto:</strong> <a href="mailto:privacidad@miboletoni.com" className="text-primary hover:underline font-medium">privacidad@miboletoni.com</a></li>
              </ul>

              {/* SECCIÓN 2 */}
              <h2>2. ¿Qué Datos Personales Recopilamos?</h2>
              <ul>
                <li>
                  <strong>Datos de Identificación:</strong> Nombre, apellido.
                </li>
                <li>
                  <strong>Datos de Contacto:</strong> Dirección de correo electrónico.
                </li>
                <li>
                  <strong>Datos de Transacción:</strong> Información sobre las compras realizadas, métodos de pago (nunca almacenamos los datos completos de tu tarjeta, estos son procesados de forma segura por la pasarela de pagos).
                </li>
                <li>
                  <strong>Datos de Navegación:</strong> Dirección IP, tipo de navegador, cookies e información sobre tu interacción con nuestro sitio para mejorar tu experiencia.
                </li>
              </ul>

              {/* SECCIÓN 3 */}
              <h2>3. ¿Con qué Finalidad Utilizamos tus Datos?</h2>
              <ul>
                <li>
                  <strong>Para gestionar tu compra:</strong> Procesar tu pedido, emitir tus boletos digitales y enviártelos al correo.
                </li>
                <li>
                  <strong>Para comunicarnos contigo:</strong> Enviarte confirmaciones de compra, notificaciones importantes sobre cambios en eventos (reprogramaciones, cancelaciones) y responder a tus consultas de soporte.
                </li>
                <li>
                  <strong>Para mejorar nuestro servicio:</strong> Analizar estadísticas anónimas de cómo usas la plataforma para optimizar la velocidad y facilidad de uso.
                </li>
                <li>
                  <strong>Para marketing (solo con tu consentimiento):</strong> Enviarte información sobre próximos eventos y promociones exclusivas que puedan interesarte.
                </li>
              </ul>

              {/* SECCIÓN 4 */}
              <h2>4. ¿Con Quién Compartimos tus Datos?</h2>
              <p>No vendemos tus datos a terceros. Solo los compartimos estrictamente con:</p>
              <ul>
                <li>
                  <strong>Los Organizadores del Evento:</strong> Compartimos tu nombre y datos de boleto con el organizador del evento específico al que asistirás, únicamente para fines de validación de acceso en la entrada.
                </li>
                <li>
                  <strong>Proveedores Tecnológicos:</strong> Empresas de confianza que nos prestan servicios críticos, como la pasarela de pagos (para procesar el cobro) y servicios de hosting/nube, quienes están obligados a proteger tu información.
                </li>
              </ul>

              {/* SECCIÓN 5 */}
              <h2>5. ¿Cuáles son tus Derechos?</h2>
              <p>
                Tienes el control absoluto de tu información. Tienes derecho a <strong>Acceder</strong>, <strong>Rectificar</strong> y <strong>Cancelar (Eliminar)</strong> tus datos personales, así como a <strong>Oponerte</strong> al tratamiento de los mismos.
              </p>
              <p>
                Para ejercer cualquiera de estos derechos, simplemente envía un correo a: <a href="mailto:privacidad@miboletoni.com" className="text-primary hover:underline font-bold">privacidad@miboletoni.com</a>.
              </p>

              {/* BOX RESUMEN */}
              <div className="bg-primary/5 p-6 rounded-xl mt-12 border border-primary/10">
                <h3 className="text-primary mt-0 text-lg">Nuestro Compromiso</h3>
                <p className="mb-0 text-sm">
                    Tus datos están seguros con nosotros. Utilizamos estándares de encriptación modernos para proteger toda la información que viaja entre tu dispositivo y nuestros servidores.
                </p>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}