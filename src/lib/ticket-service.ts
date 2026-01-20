import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { TicketPayload } from '../interfaces/payment';
import { Resend } from 'resend'; 

export class TicketService {
    private firestore = adminDb;

    // --- FINALIZAR COMPRA (Venta) ---
    async finalizePurchase(
        userId: string,
        presentationId: string,
        tickets: TicketPayload[],
        type: 'general' | 'numbered',
        totalPrice: number,
        currency: string,
        userPhone: string = '' 
    ) {
        try {
            const transactionResult = await this.firestore.runTransaction(async (transaction) => {
                // FASE 1: LECTURAS
                const presentationRef = this.firestore.collection('presentations').doc(presentationId);
                const presentationDoc = await transaction.get(presentationRef);
                if (!presentationDoc.exists) throw new Error('Presentación no encontrada.');
                const pData = presentationDoc.data();

                // Leer Evento Padre (Para el nombre real en el correo)
                let realEventName = 'Evento MiBoletoNi';
                if (pData?.eventId) {
                    const eventRef = this.firestore.collection('events').doc(pData.eventId);
                    const eventDoc = await transaction.get(eventRef);
                    if (eventDoc.exists) realEventName = eventDoc.data()?.name || realEventName;
                }

                const userRef = this.firestore.collection('users').doc(userId);
                const userDoc = await transaction.get(userRef);
                const userEmail = userDoc.exists ? userDoc.data()?.email : '';

                const ticketOps: { ref: any; currentData: any; quantity: number }[] = [];

                if (type === 'general') {
                    for (const ticket of tickets) {
                        const { tierId, quantity = 1 } = ticket;
                        const tierRef = this.firestore.doc(`presentations/${presentationId}/pricingtiers/${tierId}`);
                        const tierDoc = await transaction.get(tierRef);
                        if (!tierDoc.exists) throw new Error('Localidad inválida.');
                        ticketOps.push({ ref: tierRef, currentData: tierDoc.data(), quantity });
                    }
                } else {
                    for (const ticket of tickets) {
                        const { seatId } = ticket;
                        const seatRef = this.firestore.doc(`presentations/${presentationId}/seats/${seatId}`);
                        const seatDoc = await transaction.get(seatRef);
                        if (!seatDoc.exists) throw new Error('Asiento no existe.');
                        ticketOps.push({ ref: seatRef, currentData: seatDoc.data(), quantity: 1 });
                    }
                }

                // FASE 2: ESCRITURAS
                if (type === 'general') {
                    for (const op of ticketOps) {
                        const available = (op.currentData?.capacity || 0) - (op.currentData?.sold || 0);
                        if (available < op.quantity) throw new Error('Sin cupo suficiente.');
                        transaction.update(op.ref, { sold: FieldValue.increment(op.quantity) });
                    }
                } else {
                    for (const op of ticketOps) {
                        if (op.currentData?.status === 'sold') throw new Error('Asiento ya vendido.');
                        transaction.update(op.ref, {
                            status: 'sold',
                            reservaExpiracion: null,
                            reservaSesionId: null,
                            soldToUserId: userId
                        });
                    }
                }

                const orderId = this.firestore.collection('orders').doc().id;
                const newOrder = {
                    id: orderId, userId, userEmail, userPhone, 
                    presentationId,
                    eventId: pData?.eventId,
                    eventName: realEventName,
                    purchaseDate: FieldValue.serverTimestamp(),
                    totalPrice, currency, tickets,
                    status: 'completed', 
                    paymentMethod: 'fygaro'
                };

                transaction.set(this.firestore.collection('orders').doc(orderId), newOrder);
                transaction.set(this.firestore.collection('users').doc(userId).collection('orders').doc(orderId), newOrder);

                return { success: true, orderId, userEmail, eventName: realEventName };
            });

            if (transactionResult.success && transactionResult.userEmail) {
                this.sendTicketEmail(transactionResult.userEmail, {
                    eventName: transactionResult.eventName,
                    tickets, total: totalPrice, currency
                }, transactionResult.orderId).catch(console.error);
            }

            return { success: true, orderId: transactionResult.orderId };

        } catch (error: any) {
            console.error(`❌ Fallo en compra:`, error.message);
            throw error;
        }
    }

    // --- CANCELAR ORDEN (Reembolso) ---
    async cancelOrder(orderId: string) {
        try {
            await this.firestore.runTransaction(async (transaction) => {
                const orderRef = this.firestore.collection('orders').doc(orderId);
                const orderDoc = await transaction.get(orderRef);

                if (!orderDoc.exists) throw new Error("Orden no encontrada");
                const orderData = orderDoc.data();

                // Evitar doble cancelación
                if (orderData?.status === 'refunded' || orderData?.status === 'cancelled') return;

                const presentationId = orderData?.presentationId;
                const tickets = orderData?.tickets as TicketPayload[];

                // Devolver al Inventario
                if (presentationId && tickets) {
                    // Caso Asientos Numerados
                    if (orderData?.tickets[0]?.seatId) {
                        for (const ticket of tickets) {
                            const seatRef = this.firestore.doc(`presentations/${presentationId}/seats/${ticket.seatId}`);
                            transaction.update(seatRef, {
                                status: 'available',
                                soldToUserId: null,
                                reservaExpiracion: null,
                                reservaSesionId: null
                            });
                        }
                    } 
                    // Caso General (Restar del contador de vendidos)
                    else if (orderData?.tickets[0]?.tierId) {
                        for (const ticket of tickets) {
                            const tierRef = this.firestore.doc(`presentations/${presentationId}/pricingtiers/${ticket.tierId}`);
                            // Usamos número negativo para restar
                            transaction.update(tierRef, { 
                                sold: FieldValue.increment(- (ticket.quantity || 1)) 
                            });
                        }
                    }
                }

                // Marcar como reembolsado
                transaction.update(orderRef, { status: 'refunded', updatedAt: FieldValue.serverTimestamp() });
                
                if (orderData?.userId) {
                    const userOrderRef = this.firestore.collection('users').doc(orderData.userId).collection('orders').doc(orderId);
                    transaction.update(userOrderRef, { status: 'refunded' });
                }
            });
            console.log(`Order ${orderId} cancelada y stock liberado.`);
        } catch (error) {
            console.error("Error cancelando orden:", error);
            throw error; // Lanzamos el error para que el webhook se entere
        }
    }

    private async sendTicketEmail(userEmail: string, ticketData: any, orderId: string) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) return;
        const resend = new Resend(apiKey);
        const { eventName, total, currency } = ticketData;

        try {
            await resend.emails.send({
                from: 'MiBoletoNi <entradas@miboletoni.com>',
                to: [userEmail],
                subject: `🎟️ Tus entradas para ${eventName}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h1 style="color: #8e22bb;">¡Pago Confirmado!</h1>
                        <p>Tu orden <strong>#${orderId}</strong> está lista.</p>
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">${eventName}</p>
                            <p style="margin: 5px 0;">Total: ${currency} ${total}</p>
                        </div>
                        <a href="https://miboletoni.com/dashboard/tickets" style="background:#8e22bb; color:#fff; padding:12px 24px; text-decoration:none; border-radius:5px; display:inline-block;">Ver mis Boletos</a>
                    </div>
                `
            });
        } catch (e) { console.error("Error email:", e); }
    }
}

export const ticketService = new TicketService();