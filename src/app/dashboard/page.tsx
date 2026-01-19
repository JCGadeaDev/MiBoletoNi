
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useAuth } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { UserCircle, KeyRound, Ticket, ShieldCheck, LogOut, AppWindow, ArrowRight } from "lucide-react";
import { signOut } from "firebase/auth";
import { clearSessionCookie } from "@/app/(auth)/auth/login/page";

// --- Componente reutilizable para las tarjetas de navegación ---
function DashboardActionCard({ href, icon: Icon, title, description }: { href: string; icon: React.ElementType; title: string; description: string; }) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full hover:border-primary hover:shadow-lg transition-all duration-200 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
        <div className="p-6 pt-0">
            <div className="text-sm font-medium text-primary flex items-center">
                <span>Acceder</span>
                <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
      </Card>
    </Link>
  );
}

// --- COMPONENTE PRINCIPAL DEL DASHBOARD ---
export default function DashboardPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const auth = useAuth();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/auth?redirect=/dashboard');
        }
    }, [user, isUserLoading, router]);
    
    const handleSignOut = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            await clearSessionCookie();
            router.push('/auth');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    if (isUserLoading || !user) {
        return <div className="flex h-screen items-center justify-center">Cargando tu cuenta...</div>;
    }

    return (
        <div className="container py-12">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mi Cuenta</h1>
                    <p className="text-muted-foreground">
                        Bienvenido, {user.displayName || user.email}. Gestiona tu perfil y tus eventos aquí.
                    </p>
                </div>
            </div>

            <div className="border-t my-6" />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <DashboardActionCard
                    href="/dashboard/profile"
                    icon={UserCircle}
                    title="Mi Información"
                    description="Edita tus datos personales y de contacto."
                />
                <DashboardActionCard
                    href="/dashboard/security"
                    icon={KeyRound}
                    title="Seguridad"
                    description="Cambia tu contraseña y gestiona la seguridad."
                />
                <DashboardActionCard
                    href="/dashboard/tickets"
                    icon={Ticket}
                    title="Mis Boletos"
                    description="Encuentra tus boletos y tu historial de compras."
                />
                <DashboardActionCard
                    href="/events"
                    icon={AppWindow}
                    title="Explorar Eventos"
                    description="Descubre nuevas aventuras y compra boletos."
                />

                {user.claims?.role === 'admin' && (
                  <DashboardActionCard
                    href="/admin"
                    icon={ShieldCheck}
                    title="Panel de Administración"
                    description="Gestiona usuarios, eventos y KPIs de la plataforma."
                  />
                )}
            </div>
        </div>
    );
}
