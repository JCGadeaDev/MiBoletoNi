import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { TicketPayload } from '../interfaces/payment';
import { Resend } from 'resend'; 

export class TicketService {
    private firestore = adminDb;

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
                // ============================================================
                // FASE 1: LECTURAS (READS) - Todo lo que sea .get() va aquí
                // ============================================================

                // 1. Leer Presentación
                const presentationRef = this.firestore.collection('presentations').doc(presentationId);
                const presentationDoc = await transaction.get(presentationRef);
                if (!presentationDoc.exists) throw new Error('Presentación no encontrada.');

                // 2. Leer Usuario (MOVIDO AQUÍ ARRIBA PARA EVITAR EL ERROR)
                const userRef = this.firestore.collection('users').doc(userId);
                const userDoc = await transaction.get(userRef);
                const userEmail = userDoc.exists ? userDoc.data()?.email : '';

                // 3. Preparar lecturas de Tiers o Asientos
                // Guardaremos las referencias y los datos leídos para usarlos en la fase de escritura
                const ticketOps: { ref: any; currentData: any; quantity: number }[] = [];

                if (type === 'general') {
                    for (const ticket of tickets) {
                        const { tierId, quantity = 1 } = ticket;
                        const tierRef = this.firestore.doc(`presentations/${presentationId}/pricingtiers/${tierId}`);
                        const tierDoc = await transaction.get(tierRef); // Lectura

                        if (!tierDoc.exists) throw new Error('Localidad inválida.');
                        ticketOps.push({ ref: tierRef, currentData: tierDoc.data(), quantity });
                    }
                } else {
                    for (const ticket of tickets) {
                        const { seatId } = ticket;
                        const seatRef = this.firestore.doc(`presentations/${presentationId}/seats/${seatId}`);
                        const seatDoc = await transaction.get(seatRef); // Lectura

                        if (!seatDoc.exists) throw new Error('Asiento no existe.');
                        ticketOps.push({ ref: seatRef, currentData: seatDoc.data(), quantity: 1 });
                    }
                }

                // ============================================================
                // FASE 2: ESCRITURAS (WRITES) - A partir de aquí, PROHIBIDO usar .get()
                // ============================================================

                const pData = presentationDoc.data();
                const eventName = pData?.eventName || 'Evento MiBoletoNi';

                // 4. Ejecutar actualizaciones de inventario
                if (type === 'general') {
                    for (const op of ticketOps) {
                        const available = (op.currentData?.capacity || 0) - (op.currentData?.sold || 0);
                        if (available < op.quantity) throw new Error('Sin cupo suficiente.');
                        
                        // Update
                        transaction.update(op.ref, { sold: FieldValue.increment(op.quantity) });
                    }
                } else {
                    for (const op of ticketOps) {
                        if (op.currentData?.status === 'sold') throw new Error('Asiento ya vendido.');
                        
                        // Update
                        transaction.update(op.ref, {
                            status: 'sold',
                            reservaExpiracion: null,
                            reservaSesionId: null,
                            soldToUserId: userId
                        });
                    }
                }

                // 5. Crear la Orden
                const orderId = this.firestore.collection('orders').doc().id;
                
                const newOrder = {
                    id: orderId, 
                    userId, 
                    userEmail, 
                    userPhone, 
                    presentationId,
                    purchaseDate: FieldValue.serverTimestamp(),
                    totalPrice, 
                    currency, 
                    tickets,
                    status: 'completed', 
                    paymentMethod: 'fygaro'
                };

                // Sets finales
                transaction.set(this.firestore.collection('orders').doc(orderId), newOrder);
                transaction.set(this.firestore.collection('users').doc(userId).collection('orders').doc(orderId), newOrder);

                return { success: true, orderId, userEmail, eventName };
            });

            // ============================================================
            // FASE 3: POST-TRANSACCIÓN (Emails) - Fuera de la transacción
            // ============================================================
            if (transactionResult.success && transactionResult.userEmail) {
                this.sendTicketEmail(transactionResult.userEmail, {
                    eventName: transactionResult.eventName,
                    tickets, 
                    total: totalPrice, 
                    currency
                }, transactionResult.orderId).catch(console.error);
            }

            return { success: true, orderId: transactionResult.orderId };

        } catch (error: any) {
            console.error(`❌ Fallo en compra:`, error.message);
            throw error;
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
                        <p>Tu orden <strong>#${orderId}</strong> ha sido procesada correctamente.</p>
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Evento:</strong> ${eventName}</p>
                            <p style="margin: 5px 0;"><strong>Total Pagado:</strong> ${currency} ${total}</p>
                        </div>
                        <p>Tus boletos ya están disponibles en tu cuenta.</p>
                        <a href="https://miboletoni.com/dashboard/tickets" style="background:#8e22bb; color:#fff; padding:12px 24px; text-decoration:none; border-radius:5px; display:inline-block; margin-top:10px;">Ver mis Boletos</a>
                    </div>
                `
            });
        } catch (e) { console.error("Error email:", e); }
    }
}

export const ticketService = new TicketService();