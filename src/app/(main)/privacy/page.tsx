'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, CalendarClock } from "lucide-react";

export default function PrivacyPage() {
  const lastUpdated = "19 de enero, 2026";

  return (
    <div className="w-full min-h-screen bg-muted/20 py-12 md:py-24 flex flex-col items-center">
      {/* Contenedor Maestro: max-w-4xl es el ancho ideal para lectura de documentos */}
      <div className="w-full max-w-4xl mx-auto px-4">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-headline text-3xl md:text-5xl font-bold mb-4 text-foreground">
                Política de Privacidad
            </h1>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-background px-4 py-1.5 rounded-full border shadow-sm">
                <CalendarClock className="w-4 h-4 text-primary" />
                <span>Actualizado: {lastUpdated}</span>
            </div>
        </div>

        {/* --- CONTENIDO --- */}
        <Card className="shadow-xl border-muted/60 overflow-hidden">
          <CardContent className="p-6 md:p-12 bg-card">
            <div className="prose prose-purple dark:prose-invert max-w-none 
                prose-headings:font-headline prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-li:marker:text-primary">
              
              <p className="lead text-lg md:text-xl text-foreground font-medium">
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
                  <strong>Datos de Identificación:</strong> Nombre y apellido.
                </li>
                <li>
                  <strong>Datos de Contacto:</strong> Dirección de correo electrónico.
                </li>
                <li>
                  <strong>Datos de Transacción:</strong> Información sobre las compras realizadas y métodos de pago (procesados de forma segura; nunca almacenamos los datos completos de tu tarjeta).
                </li>
                <li>
                  <strong>Datos de Navegación:</strong> Dirección IP, tipo de navegador y cookies para mejorar tu experiencia.
                </li>
              </ul>

              {/* SECCIÓN 3 */}
              <h2>3. ¿Con qué Finalidad Utilizamos tus Datos?</h2>
              <ul>
                <li>
                  <strong>Para gestionar tu compra:</strong> Emisión y envío de boletos digitales.
                </li>
                <li>
                  <strong>Para comunicarnos contigo:</strong> Confirmaciones, soporte técnico y notificaciones sobre cambios en los eventos.
                </li>
                <li>
                  <strong>Para mejorar nuestro servicio:</strong> Análisis de estadísticas anónimas para optimizar el sitio.
                </li>
                <li>
                  <strong>Para marketing:</strong> Solo con tu consentimiento previo para enviarte promociones exclusivas.
                </li>
              </ul>

              {/* SECCIÓN 4 */}
              <h2>4. ¿Con Quién Compartimos tus Datos?</h2>
              <p>No vendemos tus datos a terceros. Solo los compartimos estrictamente con:</p>
              <ul>
                <li>
                  <strong>Los Organizadores del Evento:</strong> Únicamente para fines de validación de acceso en la entrada.
                </li>
                <li>
                  <strong>Proveedores Tecnológicos:</strong> Pasarelas de pago y servicios de hosting que garantizan la operatividad segura de la plataforma.
                </li>
              </ul>

              {/* SECCIÓN 5 */}
              <h2>5. ¿Cuáles son tus Derechos?</h2>
              <p>
                Tienes el control absoluto de tu información. Tienes derecho a <strong>Acceder</strong>, <strong>Rectificar</strong> y <strong>Cancelar (Eliminar)</strong> tus datos personales.
              </p>
              <p>
                Para ejercer estos derechos, simplemente envía un correo a: <a href="mailto:privacidad@miboletoni.com" className="text-primary hover:underline font-bold">privacidad@miboletoni.com</a>.
              </p>

              {/* BOX RESUMEN */}
              <div className="bg-primary/5 p-6 rounded-2xl mt-12 border border-primary/10">
                <h3 className="text-primary mt-0 text-lg">Nuestro Compromiso</h3>
                <p className="mb-0 text-sm leading-relaxed">
                    Tus datos están seguros con nosotros. Utilizamos estándares de encriptación modernos (SSL) para proteger toda la información que viaja entre tu dispositivo y nuestros servidores.
                </p>
              </div>

            </div>
          </CardContent>
        </Card>
        
        {/* Footer Legal */}
        <div className="text-center mt-12 mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
                © {new Date().getFullYear()} MiBoletoNi Nicaragua - Todos los derechos reservados.
            </p>
        </div>
      </div>
    </div>
  );
}