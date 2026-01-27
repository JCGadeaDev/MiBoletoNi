'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, KeyRound, Mail, CheckCircle2 } from 'lucide-react';
import { sendPasswordResetLink } from '@/app/actions/auth-actions';

const resetSchema = z.object({
  email: z.string().email('Por favor, introduce un correo electrónico válido.'),
});

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: z.infer<typeof resetSchema>) => {
    try {
      const formData = new FormData();
      formData.append('email', values.email);
      const result = await sendPasswordResetLink(formData);

      if (result.success) {
        toast({ title: 'Correo enviado', description: result.message });
        setIsSubmitted(true);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error inesperado', description: 'Intenta nuevamente.' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-10">
      <Button variant="ghost" asChild className="mb-6 -ml-2 text-muted-foreground hover:text-primary transition-colors self-center max-w-md w-full justify-start">
        <Link href="/auth/login" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Ingreso
        </Link>
      </Button>

      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/5">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl font-black tracking-tight">¿Olvidó su contraseña?</CardTitle>
          <CardDescription className="px-4">
            No se preocupe, le enviaremos un enlace seguro para restablecerla.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                <div className="bg-green-50 border border-green-100 p-6 rounded-[2rem] flex flex-col items-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mb-3" />
                  <p className="font-bold text-green-900 text-lg">¡Correo enviado!</p>
                  <p className="text-sm text-green-800/80">Revisa tu bandeja de entrada y sigue las instrucciones.</p>
                </div>
                <Button variant="outline" onClick={() => setIsSubmitted(false)} className="rounded-full w-full h-12">
                  Intentar con otro correo
                </Button>
              </motion.div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-gray-700 ml-1">Correo electrónico</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                            <Input placeholder="tu@email.com" {...field} className="pl-12 h-14 rounded-2xl bg-muted/30 focus:bg-white border-none ring-offset-transparent focus-visible:ring-2 focus-visible:ring-primary shadow-inner" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs ml-2" />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Enviar Enlace'}
                  </Button>
                </form>
              </Form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}