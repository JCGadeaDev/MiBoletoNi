'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient'; 
import { CheckCircle2, XCircle, MailCheck, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  // Estados: 'loading', 'success', 'error'
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!oobCode) {
      setStatus('error');
      setErrorMessage('El enlace de verificación es inválido o no se encontró el código.');
      return;
    }

    // Ejecutamos la verificación apenas carga la página
    const verify = async () => {
      try {
        await applyActionCode(auth, oobCode);
        setStatus('success');
      } catch (error: any) {
        console.error(error);
        let msg = "Hubo un problema al verificar tu correo.";
        if (error.code === 'auth/invalid-action-code') {
          msg = "Este enlace ya ha sido utilizado o ha expirado.";
        }
        setErrorMessage(msg);
        setStatus('error');
      }
    };

    verify();
  }, [oobCode]);

  return (
    <Card className="w-full max-w-md shadow-2xl border-white/20 backdrop-blur-sm bg-card/95 overflow-hidden">
      {/* Barra de estado superior */}
      <div className={`h-2 w-full ${
        status === 'loading' ? 'bg-primary animate-pulse' : 
        status === 'success' ? 'bg-green-500' : 'bg-destructive'
      }`} />

      <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-6">
        
        {/* --- ESTADO: CARGANDO --- */}
        {status === 'loading' && (
          <>
            <div className="relative">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Verificando...</h2>
              <p className="text-muted-foreground">
                Estamos validando tu correo electrónico. Un momento, por favor.
              </p>
            </div>
          </>
        )}

        {/* --- ESTADO: ÉXITO --- */}
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">¡Correo Verificado!</h2>
              <p className="text-muted-foreground">
                Tu cuenta ha sido activada correctamente. Ya tienes acceso completo a MiBoletoNi.
              </p>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
              onClick={() => router.push('/auth/login')}
            >
              Iniciar Sesión <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </>
        )}

        {/* --- ESTADO: ERROR --- */}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-destructive mb-2">Error de Verificación</h2>
              <p className="text-muted-foreground">
                {errorMessage}
              </p>
            </div>
            <div className="flex flex-col w-full gap-3">
                <Button variant="outline" onClick={() => router.push('/auth/login')}>
                    Volver al inicio
                </Button>
            </div>
          </>
        )}

      </CardContent>
    </Card>
  );
}

// --- PÁGINA WRAPPER ---
export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Decoración de Fondo */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] -z-10" />
      
      <Suspense fallback={<div>Cargando...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}