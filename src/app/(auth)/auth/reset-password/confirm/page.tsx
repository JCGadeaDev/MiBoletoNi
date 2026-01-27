'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient'; 
import { Eye, EyeOff, LockKeyhole, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const resetSchema = z.object({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const oobCode = searchParams.get('oobCode');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  if (!oobCode) {
    return (
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
        <div className="h-2 bg-destructive w-full" />
        <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-4">
          <div className="p-4 bg-destructive/10 rounded-2xl animate-pulse">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-black text-destructive">Enlace Inválido</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            No encontramos el código de verificación o el enlace ya caducó. Por favor solicita uno nuevo.
          </p>
          <Button variant="outline" asChild className="mt-4 rounded-full px-8">
            <Link href="/auth/reset-password">Solicitar nuevo enlace</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (data: ResetFormValues) => {
    try {
      await confirmPasswordReset(auth, oobCode, data.password);
      setIsSuccess(true);
      toast({ title: "¡Éxito!", description: "Contraseña actualizada." });
      setTimeout(() => router.push('/auth/login'), 4000);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "El enlace ha expirado o ya fue usado." });
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
        <div className="h-2 bg-green-500 w-full" />
        <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">¡Todo listo!</h2>
            <p className="text-muted-foreground text-sm">
              Tu contraseña ha sido cambiada. <br/>
              Redirigiendo al inicio de sesión...
            </p>
          </div>
          <Button className="w-full h-12 rounded-full bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100" onClick={() => router.push('/auth/login')}>
            Ir al Login ahora
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
      <div className="h-2 bg-primary w-full" />
      <CardHeader className="text-center pb-2">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LockKeyhole className="w-7 h-7 text-primary" />
        </div>
        <CardTitle className="text-3xl font-black tracking-tight">Nueva Contraseña</CardTitle>
        <CardDescription>Crea una clave segura para proteger tu cuenta.</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-gray-700 ml-1">Nueva Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="h-14 rounded-2xl bg-muted/30 focus:bg-white border-none pr-12 shadow-inner"
                        {...field} 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-primary transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs ml-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-gray-700 ml-1">Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl bg-muted/30 focus:bg-white border-none shadow-inner" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs ml-2" />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : "Actualizar Contraseña"}
            </Button>

            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2 pt-2 transition-colors">
               <ArrowLeft className="w-4 h-4" /> Cancelar
            </Link>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function NewPasswordPage() {
  return (
    <div className="min-h-[90vh] w-full flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] -z-10" />
      <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin text-primary" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}