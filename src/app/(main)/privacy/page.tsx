import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PrivacyPage() {
  const lastUpdated = "13 de octubre 2025";

  return (
    <div className="container py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="text-center">
              <h1 className="font-headline text-3xl md:text-4xl font-bold">
                Política de Privacidad
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Última actualización: {lastUpdated}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none text-justify prose-p:mb-5">
              <p>
                En MiBoletoNi, la privacidad y seguridad de tus datos personales
                es nuestra máxima prioridad. Esta política describe cómo
                recopilamos, usamos y protegemos la información que nos
                proporcionas al utilizar nuestros servicios.
              </p>

              <h2>1. ¿Quién es el Responsable de tus Datos?</h2>
              <ul>
                <li>
                  <strong>Razón Social:</strong> MiBoletoNi S.A.
                </li>
                <li>
                  <strong>Domicilio:</strong> Managua, Nicaragua
                </li>
                <li>
                  <strong>Email de contacto:</strong>{" "}
                  <a href="mailto:privacidad@miboletoni.com">
                    privacidad@miboletoni.com
                  </a>
                </li>
              </ul>

              <h2>2. ¿Qué Datos Personales Recopilamos?</h2>
              <ul>
                <li>
                  <strong>Datos de Identificación:</strong> Nombre, apellido.
                </li>
                <li>
                  <strong>Datos de Contacto:</strong> Dirección de correo
                  electrónico.
                </li>
                <li>
                  <strong>Datos de Transacción:</strong> Información sobre las
                  compras realizadas, métodos de pago (nunca almacenamos los
                  datos completos de tu tarjeta).
                </li>
                <li>
                  <strong>Datos de Navegación:</strong> Dirección IP, tipo de
                  navegador, cookies e información sobre tu interacción con
                  nuestro sitio.
                </li>
              </ul>

              <h2>3. ¿Con qué Finalidad Utilizamos tus Datos?</h2>
              <ul>
                <li>
                  <strong>Para gestionar tu compra:</strong> Procesar tu pedido,
                  emitir tus boletos y enviártelos.
                </li>
                <li>
                  <strong>Para comunicarnos contigo:</strong> Enviarte
                  confirmaciones, notificaciones sobre cambios en eventos y
                  responder a tus consultas.
                </li>
                <li>
                  <strong>Para mejorar nuestro servicio:</strong> Analizar cómo
                  usas la plataforma para optimizar la experiencia de usuario.
                </li>
                <li>
                  <strong>Para marketing (con tu consentimiento):</strong>{" "}
                  Enviarte información sobre próximos eventos y promociones que
                  puedan interesarte.
                </li>
              </ul>

              <h2>4. ¿Con Quién Compartimos tus Datos?</h2>
              <p>No vendemos tus datos a terceros. Solo los compartimos con:</p>
              <ul>
                <li>
                  Los Organizadores del evento al que has comprado boletos, para
                  fines de validación de acceso.
                </li>
                <li>
                  Nuestros proveedores de servicios tecnológicos, como la
                  pasarela de pagos y servicios de hosting, que necesitan
                  acceder a los datos para operar.
                </li>
              </ul>

              <h2>5. ¿Cuáles son tus Derechos?</h2>
              <p>
                Tienes derecho a Acceder, Rectificar y Cancelar tus datos
                personales, así como a Oponerte al tratamiento de los mismos.
                Para ejercer tus derechos, puedes enviar un correo a{" "}
                <a href="mailto:privacidad@miboletoni.com">
                  privacidad@miboletoni.com
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
