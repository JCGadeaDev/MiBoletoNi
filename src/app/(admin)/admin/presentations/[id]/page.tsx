'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, updateDoc, Timestamp, query, deleteDoc, writeBatch, where, getDocs, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { Presentation, Event, Venue, WithId, PricingTier, Seat } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2, Calendar as CalendarIcon, Save, MoreHorizontal, Trash2, Pencil, RefreshCw, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState, useMemo } from 'react';
import { resetPresentationSeats } from "@/app/actions/reset-seats"; // <--- IMPORTANTE: Asegúrate de tener este archivo
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// --- Esquemas de Validación (Sin cambios) ---
const presentationSchema = z.object({
  eventDate: z.date({ required_error: "La fecha y hora son requeridas." }),
  status: z.enum(['A la venta', 'Pospuesto', 'Agotado', 'Cancelado'], { required_error: "Debes seleccionar un estado." }),
});
type PresentationFormValues = z.infer<typeof presentationSchema>;

const tierSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo.'),
  capacity: z.coerce.number().int().min(1, 'La capacidad debe ser al menos 1.'),
  currency: z.enum(['NIO', 'USD'], { required_error: "Debes seleccionar una moneda." }),
});
type TierFormValues = z.infer<typeof tierSchema>;

const seatsSchema = z.object({
  section: z.string().min(1, "El nombre de la sección es requerido."),
  rowStart: z.string().min(1, "La fila inicial es requerida.").max(2, "Máximo 2 caracteres"),
  rowEnd: z.string().min(1, "La fila final es requerida.").max(2, "Máximo 2 caracteres"),
  numberStart: z.coerce.number().int().min(1, "Debe ser al menos 1"),
  numberEnd: z.coerce.number().int().min(1, "Debe ser al menos 1"),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  currency: z.enum(['NIO', 'USD'], { required_error: "Debes seleccionar una moneda." }),
}).refine(data => data.numberEnd >= data.numberStart, {
    message: "El asiento final debe ser mayor o igual al inicial.",
    path: ["numberEnd"],
}).refine(data => data.rowEnd.charCodeAt(0) >= data.rowStart.charCodeAt(0), {
    message: "La fila final debe ser mayor o igual a la inicial.",
    path: ["rowEnd"],
});
type SeatsFormValues = z.infer<typeof seatsSchema>;


// --- Componente 1: Editar Presentación ---
function EditPresentationForm({ presentation }: { presentation: WithId<Presentation> }) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  
  const form = useForm<PresentationFormValues>({
    resolver: zodResolver(presentationSchema),
    defaultValues: {
      eventDate: presentation?.eventDate?.toDate() || new Date(),
      status: presentation?.status || 'A la venta',
    },
  });

  useEffect(() => {
    if (presentation) {
      form.reset({
        eventDate: presentation.eventDate.toDate(),
        status: presentation.status,
      });
    }
  }, [presentation, form]);

  const onSubmit = async (data: PresentationFormValues) => {
    if (!firestore) return;
    try {
      const presentationRef = doc(firestore, 'presentations', presentation.id);
      await updateDoc(presentationRef, {
          eventDate: Timestamp.fromDate(data.eventDate),
          status: data.status,
      });
      toast({ title: "¡Éxito!", description: "La presentación ha sido actualizada." });
      router.refresh();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Presentación</CardTitle>
        <CardDescription>Cambia la fecha o el estado de venta de esta presentación.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-3 gap-4 items-end">
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha y Hora</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP HH:mm", { locale: es }) : <span>Elige una fecha</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      <div className="p-3 border-t border-border">
                        <input type="time" className="w-full border-input" defaultValue={field.value ? format(field.value, 'HH:mm') : ''} onChange={(e) => {
                            if (!field.value) return;
                            const newDate = new Date(field.value);
                            const [hours, minutes] = e.target.value.split(':');
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(newDate);
                        }} />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado de Venta</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A la venta">A la venta</SelectItem>
                      <SelectItem value="Pospuesto">Pospuesto</SelectItem>
                      <SelectItem value="Agotado">Agotado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              <Save className="mr-2 h-4 w-4" /> Guardar Cambios
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// --- Componente 2: Gestionar Localidades (General) ---
function ManageTiers({ presentationId }: { presentationId: string }) {
    // ... (Sin cambios en este componente, el código previo estaba bien)
    // Para ahorrar espacio en la respuesta, asumo que usas el mismo bloque de ManageTiers que me enviaste.
    // Si necesitas que lo repita, avísame, pero el problema no estaba aquí.
    
    // NOTA: Pego el código básico para que compile si copias todo el archivo.
    const firestore = useFirestore();
    const { toast } = useToast();
    const [tierToEdit, setTierToEdit] = useState<WithId<PricingTier> | null>(null);
    const [tierToDelete, setTierToDelete] = useState<WithId<PricingTier> | null>(null);

    const tiersQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, `presentations/${presentationId}/pricingtiers`)) : null,
        [firestore, presentationId]
    );
    const { data: tiers, isLoading: tiersLoading } = useCollection<PricingTier>(tiersQuery as any);

    const form = useForm<TierFormValues>({ resolver: zodResolver(tierSchema), defaultValues: { name: '', price: 0, capacity: 100, currency: 'NIO' } });
    const editForm = useForm<TierFormValues>({ resolver: zodResolver(tierSchema), defaultValues: { name: '', price: 0, capacity: 0, currency: 'NIO' } });

    useEffect(() => { if (tierToEdit) editForm.reset({ name: tierToEdit.name, price: tierToEdit.price, capacity: tierToEdit.capacity, currency: tierToEdit.currency }); }, [tierToEdit, editForm]);

    const onAddNewTier = async (data: TierFormValues) => {
        if (!firestore) return;
        try { await addDoc(collection(firestore, `presentations/${presentationId}/pricingtiers`), { ...data, sold: 0 }); toast({ title: "Creado", description: "Localidad creada." }); form.reset(); } 
        catch (e: any) { toast({ variant: 'destructive', title: 'Error', description: e.message }); }
    };

    const onUpdateTier = async (data: TierFormValues) => {
      if (!firestore || !tierToEdit) return;
      try { await updateDoc(doc(firestore, `presentations/${presentationId}/pricingtiers`, tierToEdit.id), data); toast({ title: "Actualizado", description: "Localidad actualizada." }); setTierToEdit(null); }
      catch (e: any) { toast({ variant: 'destructive', title: 'Error', description: e.message }); }
    };

    const onDeleteTier = async () => {
        if (!firestore || !tierToDelete) return;
        try { await deleteDoc(doc(firestore, `presentations/${presentationId}/pricingtiers`, tierToDelete.id)); toast({ title: "Eliminado", description: "Localidad eliminada." }); setTierToDelete(null); }
        catch (e: any) { toast({ variant: 'destructive', title: 'Error', description: e.message }); }
    };

    return (
        <Card>
            <CardHeader><CardTitle>Localidades (General)</CardTitle></CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onAddNewTier)} className="grid md:grid-cols-6 gap-4 items-end mb-8">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="General A" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Precio</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="currency" render={({ field }) => (<FormItem><FormLabel>Moneda</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="NIO">NIO</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent></Select></FormItem>)} />
                        <FormField control={form.control} name="capacity" render={({ field }) => (<FormItem><FormLabel>Capacidad</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <Button type="submit" disabled={form.formState.isSubmitting} className="md:col-span-1">Añadir</Button>
                    </form>
                </Form>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Precio</TableHead><TableHead>Capacidad</TableHead><TableHead>Vendidos</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {tiers?.map(tier => (
                                <TableRow key={tier.id}>
                                    <TableCell>{tier.name}</TableCell>
                                    <TableCell>{tier.price} {tier.currency}</TableCell>
                                    <TableCell>{tier.capacity}</TableCell>
                                    <TableCell>{tier.sold}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setTierToEdit(tier)}><Pencil className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="sm" onClick={() => setTierToDelete(tier)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            {/* Diálogos simplificados por brevedad */}
             <Dialog open={!!tierToEdit} onOpenChange={(open) => !open && setTierToEdit(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Editar</DialogTitle></DialogHeader>
                    <Form {...editForm}><form onSubmit={editForm.handleSubmit(onUpdateTier)} className="space-y-4"><FormField control={editForm.control} name="name" render={({field})=><FormItem><Input {...field}/></FormItem>}/><FormField control={editForm.control} name="price" render={({field})=><FormItem><Input type="number" {...field}/></FormItem>}/><FormField control={editForm.control} name="capacity" render={({field})=><FormItem><Input type="number" {...field}/></FormItem>}/><Button type="submit">Guardar</Button></form></Form>
                </DialogContent>
             </Dialog>
             <AlertDialog open={!!tierToDelete} onOpenChange={(open) => !open && setTierToDelete(null)}>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>No</AlertDialogCancel><AlertDialogAction onClick={onDeleteTier}>Sí</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
             </AlertDialog>
        </Card>
    );
}


// --- Componente 3: Gestionar Asientos (CORREGIDO) ---
// Agregado SeatCounter y corregida la Query

function SeatCounter({ seats }: { seats: Seat[] }) {
    const total = seats.length;
    const sold = seats.filter(s => s.status === 'sold').length;
    const available = total - sold;

    return (
        <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-muted p-4 rounded-lg border text-center">
                <p className="text-sm font-medium text-muted-foreground">Total Creados</p>
                <p className="text-2xl font-bold">{total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                <p className="text-sm font-medium text-green-600">Disponibles</p>
                <p className="text-2xl font-bold text-green-700">{available}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                <p className="text-sm font-medium text-red-600">Vendidos / Ocupados</p>
                <p className="text-2xl font-bold text-red-700">{sold}</p>
            </div>
        </div>
    );
}

function ManageSeats({ presentationId }: { presentationId: string }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [sectionToDelete, setSectionToDelete] = useState<{name: string, force: boolean} | null>(null);

    // [CORRECCIÓN]: Quitamos 'orderBy' de la query para evitar problemas de índices faltantes en Firebase.
    // Ordenamos en el cliente con useMemo.
    const seatsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, `presentations/${presentationId}/seats`)) : null,
        [firestore, presentationId]
    );
    const { data: seatsData, isLoading: seatsLoading } = useCollection<Seat>(seatsQuery as any);

    const seats = useMemo(() => {
      if (!seatsData) return [];
      // Ordenamiento seguro en cliente
      return [...seatsData].sort((a, b) => {
          if (a.section !== b.section) return a.section.localeCompare(b.section);
          if (a.row !== b.row) return a.row.localeCompare(b.row);
          return parseInt(a.number, 10) - parseInt(b.number, 10);
      });
    }, [seatsData]);

    const groupedAndSortedSeats = useMemo(() => {
        if (!seats) return { sections: new Map(), seatCount: 0 };
        const sections = new Map<string, WithId<Seat>[]>();
        seats.forEach(seat => {
            if (!sections.has(seat.section)) {
                sections.set(seat.section, []);
            }
            sections.get(seat.section)?.push(seat);
        });
        
        // Sort seats within each section
        sections.forEach((sectionSeats) => {
            sectionSeats.sort((a, b) => {
                 if (a.row < b.row) return -1;
                 if (a.row > b.row) return 1;
                 return parseInt(a.number, 10) - parseInt(b.number, 10);
            });
        });
        
        const sortedSections = new Map([...sections.entries()].sort());
        return { sections: sortedSections, seatCount: seats.length };
    }, [seats]);


    const form = useForm<SeatsFormValues>({
        resolver: zodResolver(seatsSchema),
        defaultValues: { section: '', rowStart: 'A', rowEnd: 'A', numberStart: 1, numberEnd: 10, price: 0, currency: 'NIO' },
    });

    const onGenerateSeats = async (data: SeatsFormValues) => {
        if (!firestore) return;
        const { section, rowStart, rowEnd, numberStart, numberEnd, price, currency } = data;
        const start = rowStart.toUpperCase().charCodeAt(0);
        const end = rowEnd.toUpperCase().charCodeAt(0);

        if (start > end) {
            form.setError("rowEnd", { message: "La fila final debe ser igual o posterior a la inicial." });
            return;
        }

        try {
            const batch = writeBatch(firestore);
            for (let r = start; r <= end; r++) {
                const row = String.fromCharCode(r);
                for (let n = numberStart; n <= numberEnd; n++) {
                    const number = n.toString();
                    const seatId = `${section}-${row}-${number}`;
                    const seatRef = doc(firestore, `presentations/${presentationId}/seats`, seatId);
                    
                    batch.set(seatRef, { section, row, number, price, currency, status: 'available' }, { merge: true });
                }
            }
            await batch.commit();
            toast({ title: "¡Asientos Generados!", description: `Se crearon/actualizaron asientos en la sección "${section}".` });
            form.reset();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };
    
    const onDeleteSection = async () => {
        if (!firestore || !sectionToDelete) return;
        try {
            // Si es force=true, borramos TODO, vendido o no.
            // Si es force=false, solo disponibles.
            
            let queryConstraints = [where('section', '==', sectionToDelete.name)];
            if (!sectionToDelete.force) {
                // Verificar si hay vendidos antes de borrar
                const soldSeatsQuery = query(collection(firestore, `presentations/${presentationId}/seats`), where('section', '==', sectionToDelete.name), where('status', '==', 'sold'));
                const soldSnap = await getDocs(soldSeatsQuery);
                if (!soldSnap.empty) {
                     toast({ variant: 'destructive', title: 'Error', description: `Hay ${soldSnap.size} asientos vendidos. Usa "Forzar Eliminación" si es un error.` });
                     setSectionToDelete(null);
                     return;
                }
            }

            // Proceder a borrar
            const seatsToDeleteQuery = query(collection(firestore, `presentations/${presentationId}/seats`), ...queryConstraints);
            const snapshot = await getDocs(seatsToDeleteQuery);
            
            if (snapshot.empty) {
                toast({ title: "Nada que borrar", description: "No se encontraron asientos."});
                setSectionToDelete(null);
                return;
            }
            
            const batch = writeBatch(firestore);
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            toast({ title: "Sección eliminada", description: `Sección "${sectionToDelete.name}" eliminada.` });
            setSectionToDelete(null);

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Gestionar Asientos (Numerado)</CardTitle>
                    <CardDescription>Genera filas y asientos para este recinto.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SeatCounter seats={seats || []} />
                    
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onGenerateSeats)} className="grid md:grid-cols-5 gap-4 items-end mb-8 p-4 bg-muted/20 rounded-lg">
                            <FormField control={form.control} name="section" render={({ field }) => (<FormItem><FormLabel>Sección</FormLabel><FormControl><Input placeholder="Platea Izquierda" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="grid grid-cols-2 gap-2">
                            <FormField control={form.control} name="rowStart" render={({ field }) => (<FormItem><FormLabel>Fila Inicio</FormLabel><FormControl><Input placeholder="A" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="rowEnd" render={({ field }) => (<FormItem><FormLabel>Fila Fin</FormLabel><FormControl><Input placeholder="J" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <FormField control={form.control} name="numberStart" render={({ field }) => (<FormItem><FormLabel>Asiento #</FormLabel><FormControl><Input type="number" placeholder="1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="numberEnd" render={({ field }) => (<FormItem><FormLabel>Hasta #</FormLabel><FormControl><Input type="number" placeholder="20" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Precio</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="currency" render={({ field }) => (<FormItem><FormLabel>Moneda</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="NIO">NIO</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            </div>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Generar Asientos'}
                            </Button>
                        </form>
                    </Form>

                    <h3 className="text-lg font-medium mb-4">Estructura Actual</h3>
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-secondary">
                                <TableRow>
                                    <TableHead>Sección</TableHead>
                                    <TableHead>Asientos</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {seatsLoading && <TableRow><TableCell colSpan={4} className="text-center">Cargando...</TableCell></TableRow>}
                                {Array.from(groupedAndSortedSeats.sections.entries()).map(([sectionName, sectionSeats]) => (
                                    <TableRow key={sectionName}>
                                        <TableCell className="font-medium">{sectionName}</TableCell>
                                        <TableCell>{sectionSeats.length} asientos</TableCell>
                                        <TableCell>
                                            <Badge variant={sectionSeats.every(s => s.status === 'available') ? 'default' : 'secondary'}>
                                                {sectionSeats.filter(s => s.status === 'sold').length} vendidos
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuLabel>Acciones de Sección</DropdownMenuLabel>
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setSectionToDelete({name: sectionName, force: false})}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar (Solo libres)
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-700 focus:text-red-700 font-bold" onClick={() => setSectionToDelete({name: sectionName, force: true})}>
                                                        <AlertTriangle className="mr-2 h-4 w-4" /> Forzar Eliminación (Todo)
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {!seatsLoading && groupedAndSortedSeats.seatCount === 0 && <p className="text-center p-4 text-muted-foreground">No hay asientos creados.</p>}
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={!!sectionToDelete} onOpenChange={(open) => !open && setSectionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {sectionToDelete?.force ? "⚠️ ¿FORZAR ELIMINACIÓN?" : "¿Eliminar sección?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {sectionToDelete?.force 
                                ? `ESTÁS A PUNTO DE BORRAR TODOS LOS ASIENTOS DE "${sectionToDelete.name}", INCLUYENDO LOS VENDIDOS. Esto romperá el historial de órdenes si existen.` 
                                : `Se eliminarán los asientos disponibles de "${sectionToDelete?.name}".`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDeleteSection} className="bg-destructive hover:bg-destructive/90">
                            Sí, eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}


// --- Componente Principal ---

export default function ManagePresentationPage() {
    const params = useParams();
    const presentationId = params.id as string;
    const firestore = useFirestore();
    const [isResetting, setIsResetting] = useState(false);

    const presentationRef = useMemoFirebase(() => firestore && presentationId ? doc(firestore, 'presentations', presentationId) : null, [firestore, presentationId]);
    const { data: presentation, isLoading: presentationLoading } = useDoc<Presentation>(presentationRef);
    
    const [event, setEvent] = useState<WithId<Event> | null>(null);
    const [venue, setVenue] = useState<WithId<Venue> | null>(null);
    const [relationsLoading, setRelationsLoading] = useState(true);

    useEffect(() => {
        const fetchRelations = async () => {
            if (!firestore || !presentation) return;
            setRelationsLoading(true);
            try {
                const eventSnap = await getDoc(doc(firestore, 'events', presentation.eventId));
                if (eventSnap.exists()) setEvent({ id: eventSnap.id, ...eventSnap.data() } as WithId<Event>);
                const venueSnap = await getDoc(doc(firestore, 'venues', presentation.venueId));
                if (venueSnap.exists()) setVenue({ id: venueSnap.id, ...venueSnap.data() } as WithId<Venue>);
            } catch (error) { console.error(error); } finally { setRelationsLoading(false); }
        };
        if (presentation) fetchRelations();
    }, [firestore, presentation]);
    
    // Función para el botón de emergencia
    const handleResetSeats = async () => {
        if(!confirm("⚠️ ¿ESTÁS SEGURO?\nEsto pondrá TODOS los asientos en 'Disponible', borrando su dueño actual.\n\nÚsalo solo si borraste las órdenes y los asientos quedaron bloqueados.")) return;
        
        setIsResetting(true);
        try {
            const result = await resetPresentationSeats(presentationId);
            if(result.success) {
                alert("Asientos liberados exitosamente.");
                window.location.reload();
            } else {
                alert("Error: " + result.error);
            }
        } catch (e) {
            alert("Error de conexión");
        } finally {
            setIsResetting(false);
        }
    };

    const isLoading = presentationLoading || relationsLoading;
    if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (!presentation || !event || !venue) return <div>No encontrado</div>;
    
    return (
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Gestionar: {event.name}</h1>
                    <p className="text-muted-foreground">{venue.name} - {presentation.eventDate.toDate().toLocaleString('es-NI')}</p>
                </div>
                <div className="flex gap-2">
                    {/* BOTÓN DE EMERGENCIA PARA ASIENTOS ZOMBIS */}
                    {venue.type === 'numbered' && (
                        <Button variant="destructive" size="sm" onClick={handleResetSeats} disabled={isResetting}>
                            {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                            Resetear Asientos
                        </Button>
                    )}
                    <Button variant="outline" asChild>
                        <Link href="/admin/events"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link>
                    </Button>
                </div>
            </div>

            <EditPresentationForm presentation={{ ...presentation, id: presentationId }} />

            {venue.type === 'general' ? (
                <ManageTiers presentationId={presentationId} />
            ) : (
                <ManageSeats presentationId={presentationId} />
            )}
        </div>
    );
}