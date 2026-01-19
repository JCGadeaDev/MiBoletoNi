
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogIn, LogOut, User as UserIcon, Search, ChevronDown, LayoutDashboard, Home } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import React, { useState, useContext } from 'react';

// Componentes de UI
import { Button } from '@/components/ui/button';
import { Logo } from './logo';
import { MobileNav } from './mobile-nav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { clearSessionCookie } from '@/app/(auth)/auth/page';
import { EventContext } from '@/context/EventContext';
import type { CombinedEvent } from '@/lib/types';


export function Header() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
  const { events } = useContext(EventContext);


  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const searchValue = event.currentTarget.value.trim();
      
      // Always redirect to the events page with the search query
      router.push(`/events?search=${encodeURIComponent(searchValue)}`);
      
      event.currentTarget.value = '';
      if (isMobileSearchVisible) {
        setIsMobileSearchVisible(false);
      }
    }
  };
  
  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth); // Sign out from client
    await clearSessionCookie(); // Clear server session
    router.push('/');
  };


  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/events", label: "Eventos" },
    { href: "/about", label: "¿Quiénes Somos?" },
    { href: "/puntos-de-venta", label: "Puntos de Venta" },
    { href: "/faq", label: "Preguntas Frecuentes" },
    { href: "/contact", label: "Contáctanos" },
  ];

  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) {
    return (
        <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="container flex h-16 items-center justify-between">
                <div className="hidden lg:block">
                  <Logo />
                </div>
                <div className="lg:hidden">
                  <MobileNav />
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost">
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    Hola, {user.displayName?.split(' ')[0] ?? 'Usuario'}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.displayName ?? 'Usuario'}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild><Link href="/dashboard"><UserIcon className="mr-2 h-4 w-4" />Mi Cuenta</Link></DropdownMenuItem>
                                {user.claims?.role === 'admin' && <DropdownMenuItem asChild><Link href="/admin"><LayoutDashboard className="mr-2 h-4 w-4" />Admin</Link></DropdownMenuItem>}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Cerrar Sesión</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button asChild><Link href="/auth">Iniciar Sesión</Link></Button>
                    )}
                </div>
            </div>
        </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Vista Móvil */}
      <div className="flex h-16 items-center justify-between px-4 md:hidden">
        {isMobileSearchVisible ? (
          <div className="flex w-full items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar evento..."
              className="h-10 flex-1"
              onKeyDown={handleSearch}
              autoFocus
            />
            <Button variant="ghost" onClick={() => setIsMobileSearchVisible(false)}>Cancelar</Button>
          </div>
        ) : (
          <>
            <Logo />
            <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchVisible(true)}>
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Buscar</span>
                </Button>
                {user ? (
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon">
                            <UserIcon className="h-5 w-5" />
                            <span className="sr-only">Mi Cuenta</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.displayName ?? 'Usuario'}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild><Link href="/dashboard"><UserIcon className="mr-2 h-4 w-4" />Mi Cuenta</Link></DropdownMenuItem>
                      {user.claims?.role === 'admin' && <DropdownMenuItem asChild><Link href="/admin"><LayoutDashboard className="mr-2 h-4 w-4" />Admin</Link></DropdownMenuItem>}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild variant="ghost" size="icon">
                    <Link href="/auth">
                      <UserIcon className="h-5 w-5" />
                      <span className="sr-only">Iniciar Sesión</span>
                    </Link>
                  </Button>
                )}
                <MobileNav />
            </div>
          </>
        )}
      </div>
      
      {/* Vista de Escritorio */}
      <div className="container hidden md:flex flex-col py-2 gap-2">
        {/* Fila Superior: Logo, Navegación, Usuario */}
        <div className="flex justify-between items-center w-full">
            <div className="flex-shrink-0">
                <Logo />
            </div>
            <nav className="flex-grow flex items-center justify-center gap-6">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="flex-shrink-0 flex items-center justify-end">
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                                <UserIcon className="mr-2 h-4 w-4" />
                                Hola, {user.displayName?.split(' ')[0] ?? 'Usuario'}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.displayName ?? 'Usuario'}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild><Link href="/dashboard"><UserIcon className="mr-2 h-4 w-4" />Mi Cuenta</Link></DropdownMenuItem>
                            {user.claims?.role === 'admin' && <DropdownMenuItem asChild><Link href="/admin"><LayoutDashboard className="mr-2 h-4 w-4" />Admin</Link></DropdownMenuItem>}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Cerrar Sesión</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button asChild size="sm" variant="outline">
                        <Link href="/auth">
                            <LogIn className="mr-2 h-4 w-4" />
                            Ingresar
                        </Link>
                    </Button>
                )}
            </div>
        </div>
        {/* Fila Inferior: Barra de Búsqueda */}
        <div className="flex items-center justify-center w-full">
            <div className="relative w-full max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por evento, ciudad o recinto..."
                    className="h-9 w-full rounded-full bg-secondary pl-9 pr-4 text-sm"
                    onKeyDown={handleSearch}
                />
            </div>
        </div>
      </div>
    </header>
  );
}
