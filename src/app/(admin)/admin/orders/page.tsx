'use client';

import { PageHeader, PageHeaderTitle, PageHeaderActions } from "@/components/pages/admin/page-header";
import { Button } from "@/components/ui/button";
import { FileDown, ArrowLeft, Trash2, Loader2, Ban, RefreshCcw } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import type { Order } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { deleteAllOrders } from "@/app/actions/orders";

function OrderManagementView() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    
    // Estados
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null); // Nuevo estado para loader individual

    // Fetch de órdenes
    const fetchAllOrders = async () => {
        if (!firestore) return;
        setIsLoading(true);
        try {
            const ordersQuery = query(collection(firestore, "orders"), orderBy("purchaseDate", "desc"));
            const querySnapshot = await getDocs(ordersQuery);
            const allOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setOrders(allOrders);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching all orders:", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!firestore || !user || isUserLoading || user.claims?.role !== 'admin') {
            setIsLoading(false);
            return;
        }
        fetchAllOrders();
    }, [firestore, user, isUserLoading]);

    // --- NUEVA FUNCIÓN: ANULAR UNA ORDEN INDIVIDUAL ---
    const handleCancelSingleOrder = async (orderId: string) => {
        const reason = window.prompt("⚠️ ¿Estás seguro de ANULAR esta orden?\n\nEsto invalidará los boletos y liberará los asientos.\n\nEscribe la razón de la anulación:");
        
        if (!reason) return; // Si cancela o lo deja vacío (puedes obligar a escribir si quieres)

        setCancellingId(orderId);
        try {
            const response = await fetch('/api/admin/orders/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    orderId, 
                    reason 
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Error al anular");

            toast({ title: "Orden Anulada", description: "El inventario ha sido liberado correctamente." });
            
            // Recargamos las órdenes para ver el cambio de estado
            await fetchAllOrders();

        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setCancellingId(null);
        }
    };

    // Función para borrar TODAS las órdenes (Limpieza masiva)
    const handleClearOrders = async () => {
        const confirmed = window.confirm("⚠️ ¿ESTÁS SEGURO?\nEsto borrará TODAS las órdenes de la base de datos permanentemente.\nEsta acción no se puede deshacer.");
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            const result = await deleteAllOrders();
            if (result.success) {
                toast({ title: "Limpieza Completada", description: result.message });
                setOrders([]); 
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error });
            }
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Falló la conexión con el servidor." });
        } finally {
            setIsDeleting(false);
        }
    };

    // Función reporte
    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        try {
            const idToken = await user?.getIdToken();
            if (!idToken) throw new Error("No se pudo obtener el token.");

            const response = await fetch('/api/reports/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en el servidor');
            }

            const result = await response.json();
            
            if (result.csv) {
                const byteCharacters = atob(result.csv);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'text/csv;charset=utf-8;' });
                
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast({ title: "Éxito", description: "El reporte se ha descargado." });
            } else {
                 toast({ title: "Información", description: "No hay datos para generar un reporte." });
            }
        } catch (error: any) {
            console.error("Error generating sales report: ", error);
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsGeneratingReport(false);
        }
    };

    return (
         <div className="space-y-4">
             <PageHeader>
                <PageHeaderTitle>Historial de Órdenes</PageHeaderTitle>
                <PageHeaderActions>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={fetchAllOrders}
                        className="mr-2"
                    >
                        <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>

                    <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleClearOrders} 
                        disabled={isDeleting || orders.length === 0}
                        className="mr-2"
                    >
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Limpiar Todo
                    </Button>

                    <Button variant="outline" size="sm" onClick={handleGenerateReport} disabled={isGeneratingReport}>
                        <FileDown className="mr-2 h-4 w-4" />
                        {isGeneratingReport ? "Generando..." : "Exportar CSV"}
                    </Button>
                </PageHeaderActions>
            </PageHeader>

            {isLoading && orders.length === 0 && <p className="p-4 text-muted-foreground">Cargando órdenes...</p>}
            {error && <p className="p-4 text-destructive">Error al cargar órdenes.</p>}
            
            {!isLoading && !error && (
                <div className="border rounded-lg bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Boletos</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.map((order) => {
                                const firstTicket = order.tickets?.[0];
                                const ticketDescription = firstTicket 
                                    ? (firstTicket.tierName ? `${firstTicket.quantity} x ${firstTicket.tierName}` : `${order.tickets.length} x Asiento(s)`)
                                    : 'Sin boletos';
                                
                                const isRefunded = order.status === 'refunded' || order.status === 'cancelled';

                                return (
                                <TableRow key={order.id} className={isRefunded ? "bg-red-50 opacity-70" : ""}>
                                    <TableCell className="font-mono text-xs">{order.id.slice(-6).toUpperCase()}</TableCell>
                                    
                                    <TableCell>
                                        <Badge variant={isRefunded ? "destructive" : order.status === 'completed' ? "default" : "secondary"}>
                                            {isRefunded ? "REEMBOLSADO" : order.status === 'completed' ? "PAGADO" : order.status}
                                        </Badge>
                                    </TableCell>
                                    
                                    <TableCell className="font-mono text-xs max-w-[150px] truncate" title={order.userId}>
                                        {order.userEmail || order.userId}
                                    </TableCell>
                                    
                                    <TableCell>
                                        <span className="font-medium text-sm">{order.currency} {order.totalPrice.toFixed(2)}</span>
                                    </TableCell>
                                    
                                    <TableCell className="text-xs text-muted-foreground">
                                        {order.purchaseDate?.toDate ? order.purchaseDate.toDate().toLocaleDateString() : '-'}
                                    </TableCell>
                                    
                                    <TableCell>
                                        <div className="text-xs font-semibold">{ticketDescription}</div>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        {!isRefunded && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                                onClick={() => handleCancelSingleOrder(order.id)}
                                                disabled={cancellingId === order.id}
                                                title="Anular Orden y Liberar Asientos"
                                            >
                                                {cancellingId === order.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Ban className="h-4 w-4" />
                                                )}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                                )
                            })}
                            {orders?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No hay órdenes registradas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

export default function AdminOrdersPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && (!user || user.claims?.role !== 'admin')) {
            router.replace('/auth?redirect=/admin/orders');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || !user || user.claims?.role !== 'admin') {
        return <div className="flex h-screen items-center justify-center">Verificando acceso...</div>;
    }
    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <Button variant="ghost" asChild className="mb-4 -ml-4">
                <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Regresar al Panel</Link>
            </Button>
            <OrderManagementView />
        </div>
    )
}