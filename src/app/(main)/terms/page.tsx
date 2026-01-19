'use client';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function TermsPage() {
  const lastUpdated = "13 de octubre, 2025";

  return (
    <div className="container py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
            <CardHeader>
                <div className="text-center">
                    <h1 className="font-headline text-3xl md:text-4xl font-bold">
                    Términos y Condiciones de Uso
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">Última actualización: {lastUpdated}</p>
                </div>
            </CardHeader>
            <CardContent>
                <div className="prose dark:prose-invert max-w-none text-justify prose-p:mb-5">
                    <p>
                    Bienvenido a MiBoletoNi. Al acceder y utilizar nuestra plataforma web (el "Sitio"), usted ("el Usuario") acepta y se compromete a cumplir los siguientes Términos y Condiciones. Por favor, léalos detenidamente. Si no está de acuerdo, debe abstenerse de utilizar el Sitio.
                    </p>

                    <h2>1. Definiciones</h2>
                    <ul>
                    <li><strong>Plataforma:</strong> Se refiere al sitio web MiBoletoNi.</li>
                    <li><strong>Usuario:</strong> Cualquier persona que navega o utiliza los servicios de la Plataforma para comprar boletos.</li>
                    <li><strong>Organizador:</strong> La persona, empresa o entidad responsable de la producción y ejecución de un evento.</li>
                    <li><strong>Boleto:</strong> El documento digital que acredita el derecho a acceder a un evento específico.</li>
                    </ul>

                    <h2>2. Objeto del Servicio</h2>
                    <p>
                    MiBoletoNi actúa como un intermediario tecnológico, facilitando la venta de boletos para eventos publicados por Organizadores externos. MiBoletoNi no es el organizador de los eventos y su responsabilidad se limita a la correcta emisión y entrega del boleto digital.
                    </p>

                    <h2>3. Proceso de Compra</h2>
                    <p>
                    El Usuario es responsable de revisar todos los detalles del evento (fecha, hora, lugar, artista) antes de realizar la compra. Todas las ventas son finales. No se aceptan cambios, devoluciones ni cancelaciones, salvo en los casos previstos en la sección 4.
                    </p>
                    
                    <h2>4. Política de Cancelación y Reembolso</h2>
                    <p>
                    La cancelación, posposición o cualquier alteración de las condiciones de un evento son responsabilidad exclusiva del Organizador. En caso de cancelación, MiBoletoNi procederá al reembolso del valor del boleto (excluyendo el cargo por servicio, salvo que el Organizador disponga lo contrario) siguiendo las instrucciones y plazos establecidos por el Organizador.
                    </p>

                    <h2>5. Obligaciones del Usuario</h2>
                    <p>
                    El Usuario se compromete a proporcionar información veraz y a custodiar la confidencialidad de sus boletos. La reventa de boletos está prohibida.
                    </p>

                    <h2>6. Limitación de Responsabilidad</h2>
                    <p>
                    MiBoletoNi no se hace responsable de la calidad del evento, la organización, la seguridad dentro del recinto, ni de cualquier incidente que ocurra durante el mismo.
                    </p>

                    <h2>7. Ley Aplicable y Jurisdicción</h2>
                    <p>
                    Estos Términos se rigen por las leyes de la República de Nicaragua. Cualquier disputa será sometida a la jurisdicción de los tribunales de la ciudad de Managua.
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
