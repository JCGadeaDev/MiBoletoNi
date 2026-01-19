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
                const presentationRef = this.firestore.collection('presentations').doc(presentationId);
                const presentationDoc = await transaction.get(presentationRef);

                if (!presentationDoc.exists) throw new Error('Presentación no encontrada.');
                
                const pData = presentationDoc.data();
                const eventName = pData?.eventName || 'Evento MiBoletoNi';
                const updatesToPerform: Array<() => void> = [];

                if (type === 'general') {
                    for (const ticket of tickets) {
                        const { tierId, quantity = 1 } = ticket;
                        const tierRef = this.firestore.doc(`presentations/${presentationId}/pricingtiers/${tierId}`);
                        const tierDoc = await transaction.get(tierRef);

                        if (!tierDoc.exists) throw new Error('Localidad inválida.');
                        const tData = tierDoc.data();
                        
                        if (((tData?.capacity || 0) - (tData?.sold || 0)) < quantity) {
                            throw new Error('Sin cupo suficiente.');
                        }
                        
                        updatesToPerform.push(() => {
                            transaction.update(tierRef, { sold: FieldValue.increment(quantity) });
                        });
                    }
                } else {
                    for (const ticket of tickets) {
                        const { seatId } = ticket;
                        const seatRef = this.firestore.doc(`presentations/${presentationId}/seats/${seatId}`);
                        const seatDoc = await transaction.get(seatRef);

                        if (!seatDoc.exists) throw new Error('Asiento no existe.');
                        if (seatDoc.data()?.status === 'sold') throw new Error('Asiento ya vendido.');
                        
                        updatesToPerform.push(() => {
                            transaction.update(seatRef, {
                                status: 'sold',
                                reservaExpiracion: null,
                                reservaSesionId: null,
                                soldToUserId: userId
                            });
                        });
                    }
                }

                updatesToPerform.forEach(fn => fn());

                const orderId = this.firestore.collection('orders').doc().id;
                const userDoc = await transaction.get(this.firestore.collection('users').doc(userId));
                const userEmail = userDoc.exists ? userDoc.data()?.email : '';

                const newOrder = {
                    id: orderId, userId, userEmail, userPhone, presentationId,
                    purchaseDate: FieldValue.serverTimestamp(),
                    totalPrice, currency, tickets,
                    status: 'completed', paymentMethod: 'fygaro'
                };

                transaction.set(this.firestore.collection('orders').doc(orderId), newOrder);
                transaction.set(this.firestore.collection('users').doc(userId).collection('orders').doc(orderId), newOrder);

                return { success: true, orderId, userEmail, eventName };
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
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h1 style="color: #8e22bb;">¡Pago Confirmado!</h1>
                        <p>Orden: <strong>#${orderId}</strong></p>
                        <p>Evento: ${eventName}</p>
                        <p>Total: ${currency} ${total}</p>
                        <a href="https://miboletoni.com/dashboard/tickets" style="background:#8e22bb; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px;">Ver mis QR</a>
                    </div>
                `
            });
        } catch (e) { console.error("Error email:", e); }
    }
}

export const ticketService = new TicketService();