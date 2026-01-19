'use server';

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";

export async function deleteAllOrders() {
    try {
        const ordersRef = adminDb.collection('orders');
        const snapshot = await ordersRef.get();

        if (snapshot.empty) {
            return { success: true, message: "No hay órdenes para borrar." };
        }

        const batch = adminDb.batch();
        let ordersCount = 0;

        // Iteramos sobre todas las órdenes para devolver el inventario
        for (const orderDoc of snapshot.docs) {
            const orderData = orderDoc.data();
            const presentationId = orderData.presentationId;
            const tickets = orderData.tickets || [];
            const userId = orderData.userId;

            // 1. Borrar la orden principal
            batch.delete(orderDoc.ref);

            // 2. Borrar la copia en el usuario (users/{uid}/orders/{id})
            if (userId) {
                const userOrderRef = adminDb.collection('users').doc(userId).collection('orders').doc(orderDoc.id);
                batch.delete(userOrderRef);
            }

            // 3. RESTAURAR INVENTARIO (Devolver asientos/tickets)
            if (presentationId && tickets.length > 0) {
                for (const ticket of tickets) {
                    // CASO A: Asientos Numerados
                    if (ticket.seatId) {
                        const seatRef = adminDb.doc(`presentations/${presentationId}/seats/${ticket.seatId}`);
                        batch.update(seatRef, {
                            status: 'available',
                            soldToUserId: null,
                            reservaSesionId: null,
                            reservaExpiracion: null
                        });
                    }
                    // CASO B: General (Tiers)
                    else if (ticket.tierId) {
                        const tierRef = adminDb.doc(`presentations/${presentationId}/pricingtiers/${ticket.tierId}`);
                        // Restamos la cantidad vendida (sold - quantity)
                        batch.update(tierRef, {
                            sold: FieldValue.increment(-ticket.quantity)
                        });
                    }
                }
            }
            ordersCount++;
        }

        await batch.commit();

        revalidatePath('/admin/orders');
        revalidatePath('/dashboard/tickets');
        return { success: true, message: `${ordersCount} órdenes eliminadas y el inventario fue restaurado.` };

    } catch (error: any) {
        console.error("Error deleting orders:", error);
        return { success: false, error: error.message };
    }
}