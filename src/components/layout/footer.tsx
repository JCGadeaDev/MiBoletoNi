'use client';
import Link from 'next/link';
import { Facebook, Instagram, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';
import { Input } from '../ui/input';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { Separator } from '../ui/separator';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { subscribeToNewsletter } from '@/app/actions/newsletter-actions';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      <span className="sr-only">Suscribirse</span>
    </Button>
  );
}

export function Footer() {
  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: 'https://www.facebook.com/profile.php?id=61585293451788&mibextid=wwXIfr&rdid=72lBuddZElfc8sKq&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Bzaoc52Tv%2F%3Fmibextid%3DwwXIfr#', label: 'Facebook' },
    { icon: <Instagram className="h-5 w-5" />, href: '#', label: 'Instagram' },
    { icon: <FaXTwitter className="h-4 w-4" />, href: '#', label: 'X' },
    { icon: <FaTiktok className="h-5 w-5" />, href: '#', label: 'TikTok' },
  ];
  
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, formAction] = useActionState(subscribeToNewsletter, {
    success: false,
    message: '',
  });

  useEffect(() => {
    if (formState.message) {
      if (formState.success) {
        toast({
          title: '¡Suscripción Exitosa!',
          description: formState.message,
        });
        formRef.current?.reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error en la Suscripción',
          description: formState.message,
        });
      }
    }
  }, [formState, toast]);


  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto py-12 text-center">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          <div className="md:col-span-3 flex flex-col items-center">
            <Logo />
            <p className="text-sm text-muted-foreground mb-4">
              Tu próxima experiencia inolvidable empieza aquí.
            </p>
            <div className="flex justify-center space-x-2">
              {socialLinks.map((link) => (
                <a 
                  key={link.label} 
                  href={link.href} 
                  aria-label={link.label} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-secondary p-2 rounded-full text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="md:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
                <h3 className="font-headline text-lg font-semibold mb-4">Empresa</h3>
                <ul className="space-y-2">
                    <li><Link href="/about" className="text-base text-muted-foreground hover:text-primary transition-colors">Quienes Somos</Link></li>
                    <li><Link href="/puntos-de-venta" className="text-base text-muted-foreground hover:text-primary transition-colors">Puntos de Venta</Link></li>
                    <li><Link href="/blog" className="text-base text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                </ul>
            </div>
            <div>
                <h3 className="font-headline text-lg font-semibold mb-4">Ayuda</h3>
                <ul className="space-y-2">
                    <li><Link href="/contact" className="text-base text-muted-foreground hover:text-primary transition-colors">Contacto</Link></li>
                    <li><Link href="/faq" className="text-base text-muted-foreground hover:text-primary transition-colors">Preguntas Frecuentes</Link></li>
                    <li><Link href="/auth" className="text-base text-muted-foreground hover:text-primary transition-colors">Mi Cuenta</Link></li>
                </ul>
            </div>
            <div>
                <h3 className="font-headline text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                    <li><Link href="/terms" className="text-base text-muted-foreground hover:text-primary transition-colors">Términos y Condiciones</Link></li>
                    <li><Link href="/privacy" className="text-base text-muted-foreground hover:text-primary transition-colors">Política de Privacidad</Link></li>
                    <li><Link href="/privacy/data-deletion" className="text-base text-muted-foreground hover:text-primary transition-colors">Eliminación de Datos</Link></li>
                </ul>
            </div>
          </div>
          <div className="md:col-span-3 flex flex-col items-center">
             <h3 className="font-headline text-lg font-semibold mb-4">Mantente al Día</h3>
             <form ref={formRef} action={formAction} className="flex w-full max-w-sm items-center space-x-2">
                <Input name="email" type="email" placeholder="Tu email" className="flex-1" required />
                <SubmitButton />
            </form>
          </div>
        </div>
      </div>
      <Separator className="my-8" />
      <div className="container pb-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MiBoletoNi. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
