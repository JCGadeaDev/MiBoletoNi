'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient'; // Asegúrate de que importas 'auth' de tu configuración
import { Eye, EyeOff, LockKeyhole, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast'; // O '@/components/ui/use-toast' según tu estructura

// --- 1. Esquema de Validación (Zod) ---
const resetSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

// --- 2. Formulario Lógico ---
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // Capturamos el código secreto (oobCode) que Firebase pone en la URL
  const oobCode = searchParams.get('oobCode');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // --- Caso: Enlace Inválido (Sin código) ---
  if (!oobCode) {
    return (
      <Card className="w-full max-w-md shadow-2xl border-destructive/20 bg-card">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="p-4 bg-destructive/10 rounded-full animate-pulse">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-destructive">Enlace Inválido o Expirado</h2>
          <p className="text-muted-foreground">
            No encontramos el código de verificación necesario. Es posible que el enlace haya caducado.
          </p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/auth/reset-password">Volver a solicitar</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // --- Manejo del Envío ---
  const onSubmit = async (data: ResetFormValues) => {
    try {
      // Intentamos cambiar la contraseña en Firebase
      await confirmPasswordReset(auth, oobCode, data.password);
      
      setIsSuccess(true);
      toast({
        title: "¡Éxito!",
        description: "Tu contraseña ha sido actualizada correctamente.",
      });

      // Redirigir al login después de unos segundos
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);

    } catch (error: any) {
      console.error(error);
      let message = "Hubo un error técnico. Inténtalo de nuevo.";
      
      // Manejo de errores específicos de Firebase
      if (error.code === 'auth/invalid-action-code') {
        message = "El enlace ha expirado o ya fue utilizado anteriormente.";
      } else if (error.code === 'auth/weak-password') {
        message = "La contraseña es muy débil.";
      }

      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: message,
      });
    }
  };

  // --- Caso: Éxito ---
  if (isSuccess) {
    return (
      <Card className="w-full max-w-md shadow-2xl border-green-200 bg-card relative overflow-hidden">
        {/* Confeti visual simple */}
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
        
        <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">¡Todo listo!</h2>
            <p className="text-muted-foreground">
              Has recuperado el acceso a tu cuenta. <br/>
              Redirigiendo al inicio de sesión...
            </p>
          </div>
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 dark:shadow-none" 
            onClick={() => router.push('/auth/login')}
          >
            Ir a Iniciar Sesión ahora
          </Button>
        </CardContent>
      </Card>
    );
  }

  // --- Caso: Formulario Normal ---
  return (
    <Card className="w-full max-w-md shadow-2xl border-white/20 backdrop-blur-sm bg-card/95">
      <CardHeader className="space-y-1 text-center pb-2">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-2xl shadow-inner">
            <LockKeyhole className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Crear Nueva Contraseña</CardTitle>
        <CardDescription className="text-base">
          Ingresa una contraseña segura para tu cuenta.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Campo Contraseña */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                        {...field} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Confirmar */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Actualizando...
                </div>
              ) : "Restablecer Contraseña"}
            </Button>

            <div className="text-center pt-2">
                <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
                </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// --- 3. Página Wrapper (Necesaria por el Suspense) ---
// Next.js requiere Suspense para usar useSearchParams en componentes cliente
export default function NewPasswordPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
      
      {/* Decoración de Fondo (Coherente con el Home) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] -z-10" />
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse">Cargando...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}