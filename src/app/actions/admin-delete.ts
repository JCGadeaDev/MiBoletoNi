'use server'

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

// --- ELIMINAR EVENTO ---
export async function deleteEventAction(eventId: string) {
    try {
        // 1. Borrar el documento del evento
        await adminDb.collection('events').doc(eventId).delete();
        
        // 2. (Opcional) Aquí podrías borrar también la colección 'presentations' asociada
        // pero por seguridad inicial, borramos solo el padre.
        
        // 3. Recargar la página para ver el cambio
        revalidatePath('/admin/events');
        
        return { success: true, message: 'Evento eliminado correctamente' };
    } catch (error: any) {
        console.error("Error eliminando evento:", error);
        return { success: false, error: error.message };
    }
}

// --- ELIMINAR RECINTO (VENUE) ---
export async function deleteVenueAction(venueId: string) {
    try {
        await adminDb.collection('venues').doc(venueId).delete();
        revalidatePath('/admin/venues');
        
        return { success: true, message: 'Recinto eliminado correctamente' };
    } catch (error: any) {
        console.error("Error eliminando recinto:", error);
        return { success: false, error: error.message };
    }
}