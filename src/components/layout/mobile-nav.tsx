
"use client";

import Link, { type LinkProps } from 'next/link';
import * as React from 'react';
import { Menu, Ticket, MapPin, Mail, HelpCircle, Users, Info, BarChart, Package, ShoppingCart, LayoutDashboard, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from './logo';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { usePathname } from 'next/navigation';
import { Separator } from '../ui/separator';

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({ href, onOpenChange, className, children, ...props }: MobileLinkProps) {
  const router = { push: (path: string) => { window.location.href = path; }};
  return (
    <Link
      href={href}
      onClick={(e) => {
        e.preventDefault();
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn("flex items-center gap-4 rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground", className)}
      {...props}
    >
      {children}
    </Link>
  );
}


export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  const mainLinks = [
    { href: "/", label: "Inicio", icon: <Home className="h-5 w-5" /> },
    { href: "/events", label: "Eventos", icon: <Ticket className="h-5 w-5" /> },
    { href: "/puntos-de-venta", label: "Puntos de Venta", icon: <MapPin className="h-5 w-5" /> },
  ];

  const secondaryLinks = [
    { href: "/about", label: "¿Quiénes Somos?", icon: <Info className="h-5 w-5" /> },
    { href: "/contact", label: "Contacto", icon: <Mail className="h-5 w-5" /> },
    { href: "/faq", label: "Preguntas Frecuentes", icon: <HelpCircle className="h-5 w-5" /> },
  ]
  
  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: <BarChart className="h-5 w-5" /> },
    { href: "/admin/events", label: "Eventos", icon: <Package className="h-5 w-5" /> },
    { href: "/admin/orders", label: "Órdenes", icon: <ShoppingCart className="h-5 w-5" /> },
    { href: "/admin/users", label: "Usuarios", icon: <Users className="h-5 w-5" /> },
];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="ml-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader className='pr-6 border-b pb-4'>
           <Logo />
           <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col justify-between pt-6">
          <nav className="flex flex-col space-y-1 text-lg font-medium pr-6">
            {isAdminPage ? (
                adminLinks.map((link) => (
                    <MobileLink key={link.href} href={link.href} onOpenChange={setOpen} className={pathname === link.href ? "bg-muted text-primary" : ""}>
                        {link.icon}
                        <span>{link.label}</span>
                    </MobileLink>
                ))
            ) : (
                <>
                    {mainLinks.map((link) => (
                    <MobileLink key={link.href} href={link.href} onOpenChange={setOpen}>
                        {link.icon}
                        <span>{link.label}</span>
                    </MobileLink>
                    ))}
                    <Accordion type="single" collapsible className="w-full text-base">
                        <AccordionItem value="item-1" className="border-none">
                            <AccordionTrigger className="hover:no-underline text-muted-foreground font-medium text-lg hover:bg-primary hover:text-primary-foreground rounded-md px-2">
                            <div className='flex items-center gap-4'>
                                    <Info className="h-5 w-5" />
                                    <span>Más Información</span>
                            </div>
                            </AccordionTrigger>
                            <AccordionContent className="pl-4 pt-2">
                                <nav className="flex flex-col space-y-1 text-lg font-medium">
                                {secondaryLinks.map((link) => (
                                    <MobileLink key={link.href} href={link.href} onOpenChange={setOpen} className="font-normal">
                                        {link.icon}
                                        <span>{link.label}</span>
                                    </MobileLink>
                                    ))}
                                </nav>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </>
            )}
          </nav>

          <div className="flex flex-col gap-4 pr-6 pb-6">
            <Separator />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
