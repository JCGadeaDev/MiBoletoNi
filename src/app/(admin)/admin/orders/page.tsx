'use client';

import { PageHeader, PageHeaderTitle, PageHeaderActions } from "@/components/pages/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Importamos Input
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileDown, ArrowLeft, Trash2, Loader2, Ban, RefreshCcw, Search, Copy } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

function OrderManagementView() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    
    // Estados principales
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    
    // Estados para búsqueda y filtrado
    const [searchTerm, setSearchTerm] = useState("");
    
    // Estados para el Modal de Cancelación
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);

    // Fetch de órdenes
    const fetchAllOrders = async () => {
        if (!firestore) return;
        setIsLoading(true);
        try {
            const ordersQuery = query(collection(firestore, "orders"), orderBy("purchaseDate", "desc"));
            const querySnapshot = await getDocs(ordersQuery);
            const allOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setOrders(allOrders);
        } catch (err: any) {
            console.error("Error fetching orders:", err);
            toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las órdenes" });
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

    // --- LÓGICA DE FILTRADO ---
    const filteredOrders = orders.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- ABRIR MODAL DE CANCELACIÓN ---
    const openCancelModal = (orderId: string) => {
        setOrderToCancel(orderId);
        setCancelReason("");
        setIsCancelModalOpen(true);
    };

    // --- EJECUTAR CANCELACIÓN (Con Token) ---
    const handleConfirmCancel = async () => {
        if (!orderToCancel || !user) return;
        if (!cancelReason.trim()) {
            toast({ variant: "destructive", title: "Razón requerida", description: "Debes especificar por qué anulas la orden." });
            return;
        }

        setIsCancelling(true);
        try {
            // 1. Obtener el Token actual del usuario (SOLUCIÓN AL ERROR 401)
            const idToken = await user.getIdToken();

            // 2. Enviar petición con el token en el header
            const response = await fetch('/api/admin/orders/cancel', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}` // <--- CLAVE DE SEGURIDAD
                },
                body: JSON.stringify({ 
                    orderId: orderToCancel, 
                    reason: cancelReason 
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Error al anular");

            toast({ title: "Orden Anulada", description: "El inventario ha sido liberado correctamente." });
            
            // Cerrar modal y recargar
            setIsCancelModalOpen(false);
            await fetchAllOrders();

        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsCancelling(false);
        }
    };

    // Funciones auxiliares (Limpieza y Reporte)...
    const handleClearOrders = async () => {
        if(!window.confirm("⚠️ ¿Borrar TODO el historial permanentemente?")) return;
        setIsDeleting(true);
        try {
            const result = await deleteAllOrders();
            if (result.success) {
                toast({ title: "Limpieza Completada", description: result.message });
                setOrders([]); 
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error });
            }
        } catch (e) { toast({ variant: "destructive", title: "Error", description: "Falló la conexión." }); }
        finally { setIsDeleting(false); }
    };

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        try {
            const idToken = await user?.getIdToken();
            if (!idToken) throw new Error("No token");
            const response = await fetch('/api/reports/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` }
            });
            if (!response.ok) throw new Error('Error servidor');
            const result = await response.json();
            if (result.csv) {
                const link = document.createElement('a');
                link.href = `data:text/csv;base64,${result.csv}`;
                link.download = `reporte_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
                toast({ title: "Éxito", description: "Reporte descargado." });
            } else {
                 toast({ title: "Info", description: "Sin datos para reporte." });
            }
        } catch (error: any) { toast({ variant: "destructive", title: "Error", description: error.message }); }
        finally { setIsGeneratingReport(false); }
    };

    return (
         <div className="space-y-4">
             <PageHeader>
                <PageHeaderTitle>Historial de Órdenes</PageHeaderTitle>
                <PageHeaderActions>
                    <Button variant="outline" size="sm" onClick={fetchAllOrders} disabled={isLoading} className="mr-2">
                        <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleClearOrders} disabled={isDeleting || orders.length === 0} className="mr-2">
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Limpiar Todo
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleGenerateReport} disabled={isGeneratingReport}>
                        <FileDown className="mr-2 h-4 w-4" />
                        {isGeneratingReport ? "..." : "CSV"}
                    </Button>
                </PageHeaderActions>
            </PageHeader>

            {/* BARRA DE BÚSQUEDA */}
            <div className="flex items-center space-x-2 bg-white p-2 rounded-md border max-w-sm">
                <Search className="h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="Buscar por Número de Orden..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-none shadow-none focus-visible:ring-0 h-8"
                />
            </div>

            {/* TABLA */}
            <div className="border rounded-lg bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Número de Orden</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Boletos</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => {
                                const isRefunded = order.status === 'refunded' || order.status === 'cancelled';
                                const firstTicket = order.tickets?.[0];
                                const ticketDesc = firstTicket 
                                    ? (firstTicket.tierName ? `${firstTicket.quantity} x ${firstTicket.tierName}` : `${order.tickets.length} x Asiento(s)`)
                                    : 'Sin boletos';

                                return (
                                <TableRow key={order.id} className={isRefunded ? "bg-red-50 opacity-70" : ""}>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-mono text-xs font-bold">{order.id}</span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-4 w-4 text-gray-400 hover:text-black"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(order.id);
                                                    toast({description: "ID copiado"});
                                                }}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Badge variant={isRefunded ? "destructive" : order.status === 'completed' ? "default" : "secondary"}>
                                            {isRefunded ? "ANULADA" : order.status === 'completed' ? "PAGADO" : order.status}
                                        </Badge>
                                    </TableCell>
                                    
                                    <TableCell className="font-mono text-xs truncate max-w-[150px]" title={order.userId}>
                                        {order.userEmail || order.userId}
                                    </TableCell>
                                    
                                    <TableCell>
                                        <span className="font-medium text-sm">{order.currency} {order.totalPrice.toFixed(2)}</span>
                                    </TableCell>
                                    
                                    <TableCell className="text-xs text-muted-foreground">
                                        {order.purchaseDate?.toDate ? order.purchaseDate.toDate().toLocaleDateString() : '-'}
                                    </TableCell>
                                    
                                    <TableCell>
                                        <div className="text-xs font-semibold">{ticketDesc}</div>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        {!isRefunded && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                                onClick={() => openCancelModal(order.id)}
                                                title="Anular Orden"
                                            >
                                                <Ban className="h-4 w-4 mr-1" /> Anular
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    {isLoading ? "Cargando..." : "No se encontraron órdenes."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* MODAL DE CONFIRMACIÓN DE ANULACIÓN */}
            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <Ban className="h-5 w-5" /> Confirmar Anulación
                        </DialogTitle>
                        <DialogDescription>
                            Estás a punto de anular la orden <strong>{orderToCancel}</strong>.
                            <br />
                            Esta acción invalidará los boletos y liberará los asientos inmediatamente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Label htmlFor="reason" className="mb-2 block">Razón de la anulación:</Label>
                        <Textarea 
                            id="reason"
                            placeholder="Ej: Cliente solicitó cambio, Error de cajero..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelModalOpen(false)} disabled={isCancelling}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmCancel} disabled={isCancelling || !cancelReason.trim()}>
                            {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirmar Anulación"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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