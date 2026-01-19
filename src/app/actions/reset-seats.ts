'use server';

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

export async function resetPresentationSeats(presentationId: string) {
    try {
        console.log(`🔄 Reseteando asientos para: ${presentationId}`);
        const seatsRef = adminDb.collection('presentations').doc(presentationId).collection('seats');
        const snapshot = await seatsRef.get();

        if (snapshot.empty) {
            return { success: false, message: "No se encontraron asientos en esta presentación." };
        }

        const batch = adminDb.batch();
        let count = 0;

        snapshot.docs.forEach((doc) => {
            // Forzamos el estado a 'available' y borramos datos de venta/reserva
            batch.update(doc.ref, {
                status: 'available',
                userId: null,        // Campo legado si lo usabas
                soldToUserId: null,  // Campo nuevo
                reservaSesionId: null,
                reservaExpiracion: null
            });
            count++;
        });

        await batch.commit();

        revalidatePath(`/admin/presentations/${presentationId}`);
        return { success: true, message: `${count} asientos han sido liberados y reseteados.` };

    } catch (error: any) {
        console.error("Error resetting seats:", error);
        return { success: false, error: error.message };
    }
}