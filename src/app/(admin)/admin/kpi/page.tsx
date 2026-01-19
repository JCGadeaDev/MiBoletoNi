
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Ticket, Users, DollarSign, Calendar as CalendarIcon } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, getDocs, where } from "firebase/firestore";
import type { Order, Presentation, User } from "@/lib/types";

// --- Componentes de la Página de KPIs ---
function KpiCard({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description: string }) {
    return (<Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{value}</div><p className="text-xs text-muted-foreground">{description}</p></CardContent></Card>);
}

function LoadingKpiCard({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                <div className="h-4 w-full bg-muted rounded animate-pulse mt-2" />
            </CardContent>
        </Card>
    );
}

function DashboardView() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const [kpis, setKpis] = useState({ todayRevenue: 0, todayTickets: 0, activeEvents: 0, newUsers: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Wait until firestore is initialized, user loading is finished, and the user is confirmed as admin
        if (!firestore || isUserLoading || !user?.claims?.role || user.claims.role !== 'admin') {
            if (!isUserLoading && user && user?.claims?.role !== 'admin') {
                setError("No tienes permisos para ver esta información.");
                setIsLoading(false);
            }
            return;
        }

        const fetchKpis = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch all data in parallel from root collections
                const [ordersSnapshot, presentationsSnapshot, usersSnapshot] = await Promise.all([
                    getDocs(query(collection(firestore, "orders"))),
                    getDocs(query(collection(firestore, "presentations"))),
                    getDocs(query(collection(firestore, "users")))
                ]);

                // Process Orders for today's revenue and tickets
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                let revenue = 0;
                let ticketsSold = 0;
                ordersSnapshot.forEach(doc => {
                    const order = doc.data() as Order;
                    const purchaseDate = order.purchaseDate?.toDate();
                    if (purchaseDate && purchaseDate >= todayStart) {
                        revenue += order.totalPrice || 0;
                        order.tickets.forEach(ticket => {
                            if (ticket.quantity) { // For general admission
                                ticketsSold += ticket.quantity;
                            } else { // For numbered seats
                                ticketsSold += 1;
                            }
                        });
                    }
                });
                
                // Process Presentations for active events
                const allPresentations = presentationsSnapshot.docs.map(doc => doc.data() as Presentation);
                const activeEventsCount = allPresentations.filter(p => p.status === "A la venta").length;

                // Process Users for new sign-ups in the last 30 days
                const allUsers = usersSnapshot.docs.map(doc => doc.data() as User);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const newUsersCount = allUsers.filter(user => {
                    const createdAt = user.createdAt?.toDate();
                    return createdAt && createdAt >= thirtyDaysAgo;
                }).length;

                setKpis({
                    todayRevenue: revenue,
                    todayTickets: ticketsSold,
                    activeEvents: activeEventsCount,
                    newUsers: newUsersCount,
                });

            } catch (err: any) {
                console.error("Error fetching KPI data:", err);
                // DEBUG: Help user diagnose permissions
                if (err.code === 'permission-denied') {
                     console.error("DEBUG PERMISSIONS: Your current role is:", user?.claims?.role);
                     console.error("DEBUG PERMISSIONS: Ensure you have logged out and back in after verifying your role in Firestore.");
                }
                setError("Ocurrió un error al cargar los datos para los KPIs. Por favor, verifica los permisos y la consola.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchKpis();
    }, [firestore, user, isUserLoading]);


    if (isLoading) {
        return (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <LoadingKpiCard title="Ventas Hoy (Ingresos)" icon={DollarSign} />
                <LoadingKpiCard title="Ventas Hoy (Boletos)" icon={Ticket} />
                <LoadingKpiCard title="Eventos Activos" icon={CalendarIcon} />
                <LoadingKpiCard title="Nuevos Usuarios" icon={Users} />
            </div>
        )
    }
    
    if (error) {
        return <div className="text-destructive p-4 border border-destructive/50 rounded-lg">{error}</div>
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Ventas Hoy (Ingresos)" value={`C$ ${kpis.todayRevenue.toFixed(2)}`} description="Total de ingresos generados hoy" icon={DollarSign} />
            <KpiCard title="Ventas Hoy (Boletos)" value={`+${kpis.todayTickets}`} description="Total de boletos vendidos hoy" icon={Ticket} />
            <KpiCard title="Eventos Activos" value={kpis.activeEvents} description="Presentaciones actualmente a la venta" icon={CalendarIcon} />
            <KpiCard title="Nuevos Usuarios" value={`+${kpis.newUsers}`} description="Registrados en los últimos 30 días" icon={Users} />
        </div>
    );
}

// --- Componente Principal de la Página ---
export default function AdminKpiPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && (!user || user.claims?.role !== 'admin')) {
            router.replace('/auth?redirect=/admin/kpi');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || !user || user.claims?.role !== 'admin') {
        return (
            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                 <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
                    <p className="text-muted-foreground">Verificando acceso de administrador...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
             <Button variant="ghost" asChild className="mb-4 -ml-4">
                <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Regresar al Panel</Link>
            </Button>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard de KPIs</h1>
                <p className="text-muted-foreground">Un resumen del rendimiento de la plataforma.</p>
            </div>
            <DashboardView />
        </div>
    );
}
