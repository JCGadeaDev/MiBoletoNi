
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserX, Mail } from "lucide-react";

export default function DataDeletionPage() {
  const supportEmail = "soporte@miboletoni.com";

  return (
    <div className="container py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <UserX className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle className="font-headline text-3xl md:text-4xl">
              Solicitud de Eliminación de Datos
            </CardTitle>
            <p className="text-muted-foreground pt-2">
              Instrucciones para eliminar tu cuenta y los datos asociados.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose dark:prose-invert max-w-none text-justify">
              <p>
                Entendemos y respetamos tu derecho a la privacidad y al control sobre tu información personal. Si has utilizado nuestros servicios a través de inicio de sesión con Facebook o cualquier otro método, puedes solicitar la eliminación completa de tus datos de nuestros sistemas.
              </p>

              <h3 className="font-headline">¿Qué datos se eliminarán?</h3>
              <p>
                Al procesar tu solicitud, se eliminará permanentemente la siguiente información:
              </p>
              <ul>
                <li>Tu perfil de usuario (nombre, correo electrónico, teléfono).</li>
                <li>Tu historial de compras y boletos asociados a tu cuenta.</li>
                <li>Cualquier otra información personal que hayamos recopilado durante tu uso de la plataforma.</li>
              </ul>
              <p>
                Esta acción no se puede deshacer.
              </p>

              <h3 className="font-headline">¿Cómo solicitar la eliminación?</h3>
               <Alert>
                <Mail className="h-4 w-4" />
                <AlertTitle>Paso a paso</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal list-inside space-y-2 mt-2">
                    <li>
                      Envía un correo electrónico a nuestra dirección de soporte: <strong className="text-primary">{supportEmail}</strong>.
                    </li>
                    <li>
                      Usa el asunto: <strong className="text-primary">"Solicitud de Eliminación de Datos"</strong>.
                    </li>
                    <li>
                      En el cuerpo del correo, por favor incluye el <strong>nombre y correo electrónico</strong> con el que te registraste en nuestra plataforma para que podamos identificarte.
                    </li>
                  </ol>
                </AlertDescription>
              </Alert>

              <h3 className="font-headline">Proceso y Plazos</h3>
              <p>
                Una vez recibida tu solicitud, nuestro equipo verificará tu identidad y procederá con la eliminación de tus datos en un plazo máximo de 14 días hábiles. Te enviaremos una confirmación por correo electrónico una vez que el proceso se haya completado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
