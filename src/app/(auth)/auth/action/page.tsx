'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function ActionDispatcher() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Capturar los parámetros que envía Firebase automáticamente
    const mode = searchParams.get('mode'); // 'resetPassword' | 'verifyEmail' | 'recoverEmail'
    const oobCode = searchParams.get('oobCode'); // El código secreto único
    
    // Si no hay código, es un acceso inválido, mandamos al login
    if (!oobCode) {
      router.push('/auth/login');
      return;
    }

    // 2. Redirigir según el "Modo" a la carpeta correcta
    switch (mode) {
      case 'resetPassword':
        // Redirige a: src/app/auth/reset-password/confirm/page.tsx
        router.push(`/auth/reset-password/confirm?oobCode=${oobCode}`);
        break;

      case 'verifyEmail':
        // Redirige a: src/app/auth/verify-email/page.tsx
        router.push(`/auth/verify-email?oobCode=${oobCode}`);
        break;

      case 'recoverEmail':
        // (Opcional) Si alguien cambió el correo sin permiso y quiere deshacerlo
        // Podrías crear una página para esto o mandarlo a soporte
        router.push('/auth/login'); 
        break;

      default:
        // Modo desconocido
        router.push('/auth/login');
    }
  }, [searchParams, router]);

  // Pantalla de carga mientras se hace la redirección (dura milisegundos)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <h2 className="text-lg font-semibold text-foreground">Procesando solicitud...</h2>
      <p className="text-muted-foreground text-sm">Por favor espera un momento.</p>
    </div>
  );
}

// Wrapper obligatorio para usar useSearchParams en Next.js
export default function AuthActionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ActionDispatcher />
    </Suspense>
  );
}