'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Ticket, Users, CalendarDays } from "lucide-react";

// --- Página Principal del Panel (Hub de Navegación) ---
export default function AdminPage() {
    const { user, isUserLoading } = useUser() as any; // Usamos any para evitar líos de tipos con claims
    const router = useRouter();

    // Extraemos el rol de la ubicación que confirmamos en tus logs
    const userRole = user?.claims?.role || user?.role;

    useEffect(() => {
        if (!isUserLoading) {
            // VERIFICACIÓN: Si no hay usuario o el rol (en claims o base) no es admin
            if (!user || userRole !== 'admin') {
                console.log("Acceso denegado. Rol detectado:", userRole);
                router.replace('/auth?redirect=/admin');
            }
        }
    }, [user, isUserLoading, userRole, router]);

    // Bloqueo de renderizado mientras valida
    if (isUserLoading || !user || userRole !== 'admin') {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground">Verificando nivel de acceso...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
            <p className="text-muted-foreground mb-8">Bienvenido, {user.displayName || user.email}.</p>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AdminActionCard
                    href="/admin/kpi"
                    icon={BarChart3}
                    title="Dashboard (KPIs)"
                    description="Indicadores clave de rendimiento."
                />
                <AdminActionCard
                    href="/admin/events"
                    icon={CalendarDays}
                    title="Gestión de Eventos"
                    description="Administra eventos y fechas."
                />
                <AdminActionCard
                    href="/admin/orders"
                    icon={Ticket}
                    title="Gestión de Órdenes"
                    description="Supervisa ventas y reportes."
                />
                <AdminActionCard
                    href="/admin/users"
                    icon={Users}
                    title="Gestión de Usuarios"
                    description="Administra roles de usuarios."
                />
            </div>
        </div>
    );
}

// Componente de tarjeta (se mantiene igual)
function AdminActionCard({ href, icon: Icon, title, description }: { href: string; icon: React.ElementType; title: string; description: string; }) {
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
                <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1" />
            </div>
        </div>
      </Card>
    </Link>
  );
}