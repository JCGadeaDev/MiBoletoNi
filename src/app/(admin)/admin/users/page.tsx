
'use client';
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader, PageHeaderTitle, PageHeaderActions } from "@/components/pages/admin/page-header";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { User } from "@/lib/types";
import { UserTable } from "@/components/pages/admin/users/user-table";
import { useToast } from "@/hooks/use-toast";
import { deleteUser } from "@/app/actions/user-actions";
import { useRouter } from "next/navigation";


export default function AdminUsersPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    const router = useRouter();

    // Query para obtener TODOS los usuarios.
    const usersQuery = useMemoFirebase(() => {
        if (!firestore || isUserLoading || !user) return null; 
        return query(collection(firestore, 'users'));
    }, [firestore, user, isUserLoading]);
    
    const { data: users, isLoading, error: usersError } = useCollection<User>(usersQuery);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    

    const openDeleteDialog = (userId: string) => {
        setUserToDelete(userId);
        setDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await deleteUser({ userId: userToDelete });
            toast({
                title: "Éxito",
                description: "El usuario ha sido eliminado completamente.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Ocurrió un error al eliminar el usuario.",
            });
        } finally {
            setDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const handleExportToCSV = () => {
        if (!users || users.length === 0) {
            toast({
                title: "No hay datos",
                description: "No hay usuarios para exportar.",
            });
            return;
        }

        const headers = ["ID", "Nombre", "Email", "Teléfono", "Rol"];
        const csvContent = [
            headers.join(','),
            ...users.map(u => [u.id, u.name, u.email, u.phone || '', u.role].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "usuarios.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({ title: "Exportación exitosa", description: "El archivo de usuarios ha sido descargado." });
    };
    
    useEffect(() => {
        if (!isUserLoading && (!user || user.claims?.role !== 'admin')) {
            router.replace('/auth?redirect=/admin/users');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || isLoading || !user) {
        return <div className="flex h-screen items-center justify-center">Cargando usuarios...</div>;
    }

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
             <Button variant="ghost" asChild className="mb-4 -ml-4">
                <Link href="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Regresar al Panel</Link>
            </Button>
            <PageHeader>
                <PageHeaderTitle>Gestión de Usuarios</PageHeaderTitle>
                <PageHeaderActions>
                    <Button variant="outline" onClick={handleExportToCSV}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar a CSV
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <div className="border rounded-lg">
                {usersError && <p className="p-4 text-destructive">Error al cargar usuarios: {usersError.message}</p>}
                {user && users && <UserTable users={users} onDelete={openDeleteDialog} />}
                 {!isLoading && users?.length === 0 && <p className="p-4 text-center text-muted-foreground">No se encontraron usuarios.</p>}
            </div>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás absolutely seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario
                        de Firebase Authentication y su documento de Firestore.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
