'use server'

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

// --- ELIMINAR EVENTO ---
export async function deleteEventAction(eventId: string) {
    try {
        await adminDb.collection('events').doc(eventId).delete();
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

// --- ELIMINAR PRESENTACIÓN (SUBCOLECCIÓN) ---
export async function deletePresentationAction(eventId: string, presentationId: string) {
    try {
        // Borra el documento específico dentro de la subcolección 'presentations' del evento
        await adminDb
            .collection('events')
            .doc(eventId)
            .collection('presentations')
            .doc(presentationId)
            .delete();
        
        revalidatePath('/admin/events');
        // También revalidamos la ruta dinámica si tienes una página de edición de evento
        revalidatePath(`/admin/events/${eventId}`);
        
        return { success: true, message: 'Presentación eliminada correctamente' };
    } catch (error: any) {
        console.error("Error eliminando presentación:", error);
        return { success: false, error: error.message };
    }
}