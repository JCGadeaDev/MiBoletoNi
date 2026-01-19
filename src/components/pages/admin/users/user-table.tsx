
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import type { User } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setUserRole } from "@/app/actions/user-actions";
import { useToast } from "@/hooks/use-toast";

interface UserTableProps {
    users: User[];
    onDelete: (userId: string) => void;
}


export function UserTable({ users, onDelete }: UserTableProps) {
    const { toast } = useToast();

    const handleRoleChange = async (userId: string, role: 'admin' | 'regular') => {
        try {
            // The server action revalidates the path, and useCollection
            // on the parent page will pick up the changes in real-time.
            // No manual refresh callback is needed.
            const result = await setUserRole({ userId, role });
            
            console.log("setUserRole result:", result);

            if (!result) {
                throw new Error("La acción del servidor no devolvió ningún resultado (undefined).");
            }

            if (!result.success) {
                 throw new Error(result.message || "No se pudo actualizar el rol.");
            }

            toast({
                title: "Rol Actualizado",
                description: `El rol del usuario ha sido cambiado a ${role}.`,
            });
            
        } catch (error: any) {
            console.error("Error al cambiar el rol:", error);
            toast({
                variant: 'destructive',
                title: "Error al cambiar el rol",
                description: error.message || "Ocurrió un error inesperado.",
            });
        }
    };
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>
                        <span className="sr-only">Acciones</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => {
                    return (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                            <TableCell>{user.email || 'N/A'}</TableCell>
                            <TableCell className="hidden md:table-cell">{user.phone || 'N/A'}</TableCell>
                             <TableCell>
                                <Select defaultValue={user.role} onValueChange={(value) => handleRoleChange(user.id, value as any)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Seleccionar rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="regular">Regular</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuItem disabled>Editar</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDelete(user.id)}>Eliminar</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    );
}
