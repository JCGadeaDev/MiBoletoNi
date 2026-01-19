import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { TicketPayload } from '../interfaces/payment';
import { Resend } from 'resend'; 

// 🛑 BORRÉ LA LÍNEA QUE DABA ERROR AQUÍ (const resend = ...)

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
            // --- PASO 1: TRANSACCIÓN DE BASE DE DATOS ---
            const transactionResult = await this.firestore.runTransaction(async (transaction) => {
                // 1. Leer Presentación
                const presentationRef = this.firestore.collection('presentations').doc(presentationId);
                const presentationDoc = await transaction.get(presentationRef);

                if (!presentationDoc.exists || presentationDoc.data()?.status !== 'A la venta') {
                    throw new Error('Esta presentación ya no está disponible para la venta.');
                }
                
                const eventName = presentationDoc.data()?.eventName || 'Evento MiBoletoNi';
                const updatesToPerform: Array<() => void> = [];

                if (type === 'general') {
                    const tierReads = tickets.map(ticket => {
                        const { tierId } = ticket;
                        if (!tierId) return null;
                        const ref = this.firestore.doc(`presentations/${presentationId}/pricingtiers/${tierId}`);
                        return { ref, ticket };
                    }).filter(item => item !== null);

                    const tierDocs = await Promise.all(tierReads.map(item => transaction.get(item!.ref)));

                    tierDocs.forEach((doc, index) => {
                        const { ticket } = tierReads[index]!;
                        // CORRECCIÓN TS: Aseguramos que quantity tenga valor (default 1)
                        const quantity = ticket.quantity || 1; 
                        const tierName = ticket.tierName || 'General';

                        if (!doc.exists) throw new Error(`La localidad ${tierName} no existe.`);
                        const tierData = doc.data();
                        if (!tierData) throw new Error(`Datos no encontrados para ${tierName}`);
                        
                        const available = tierData.capacity - (tierData.sold || 0);
                        if (available < quantity) throw new Error(`No hay suficientes boletos para ${tierData.name}.`);
                        
                        updatesToPerform.push(() => {
                            transaction.update(tierReads[index]!.ref, { sold: FieldValue.increment(quantity) });
                        });
                    });

                } else if (type === 'numbered') {
                    const seatReads = tickets.map(ticket => {
                        const { seatId } = ticket;
                        if (!seatId) return null;
                        const ref = this.firestore.doc(`presentations/${presentationId}/seats/${seatId}`);
                        return { ref, ticket };
                    }).filter(item => item !== null);

                    const seatDocs = await Promise.all(seatReads.map(item => transaction.get(item!.ref)));

                    seatDocs.forEach((doc, index) => {
                        const { ticket } = seatReads[index]!;
                        const { row, number } = ticket;
                        if (!doc.exists) throw new Error(`El asiento ${row}-${number} no existe.`);
                        
                        const seatData = doc.data();
                        if (seatData?.status !== 'reserved' || seatData?.reservaSesionId !== userId) {
                            throw new Error(`El asiento ${row}-${number} ya no está reservado para ti o expiró.`);
                        }
                        
                        updatesToPerform.push(() => {
                            transaction.update(seatReads[index]!.ref, {
                                status: 'sold',
                                reservaExpiracion: null,
                                reservaSesionId: null,
                                soldToUserId: userId
                            });
                        });
                    });
                }

                // Ejecutar actualizaciones
                updatesToPerform.forEach(updateFn => updateFn());

                // Crear Orden
                const orderId = this.firestore.collection('orders').doc().id;
                
                const userDoc = await transaction.get(this.firestore.collection('users').doc(userId));
                const userEmail = userDoc.exists ? userDoc.data()?.email : '';

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

                const orderRef = this.firestore.collection('orders').doc(orderId);
                transaction.set(orderRef, newOrder);

                const userOrderRef = this.firestore.collection('users').doc(userId).collection('orders').doc(orderId);
                transaction.set(userOrderRef, newOrder);

                return { success: true, orderId, userEmail, eventName, totalPrice, currency, tickets };
            });

            // --- PASO 2: ENVIAR CORREO ---
            if (transactionResult.success && transactionResult.userEmail) {
                await this.sendTicketEmail(
                    transactionResult.userEmail,
                    {
                        eventName: transactionResult.eventName,
                        tickets: tickets,
                        total: totalPrice,
                        currency: currency
                    },
                    transactionResult.orderId
                );
            }

            console.log(`✅ Purchase flow completed. Order ID: ${transactionResult.orderId}`);
            return { success: true, orderId: transactionResult.orderId };

        } catch (error) {
            console.error(`❌ Failed to finalize purchase for user ${userId}:`, error);
            throw error;
        }
    }

    // --- HELPER PRIVADO PARA ENVIAR CORREO ---
    private async sendTicketEmail(userEmail: string, ticketData: any, orderId: string) {
        // ✅ CORRECCIÓN: Inicializamos Resend AQUÍ ADENTRO
        // Esto evita que el Build falle porque la variable de entorno no existe todavía.
        const resend = new Resend(process.env.RESEND_API_KEY);

        try {
            console.log(`📧 Enviando tickets a: ${userEmail}`);

            const { eventName, tickets, total, currency } = ticketData;

            await resend.emails.send({
                from: 'MiBoletoNi <entradas@miboletoni.com>', 
                to: [userEmail],
                bcc: ['ventas@miboletoni.com'], 
                subject: `🎟️ Tus entradas para ${eventName} (Orden #${orderId})`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #2563eb;">¡Aquí están tus entradas!</h1>
                        <p>Hola,</p>
                        <p>Gracias por tu compra. Tu orden <strong>#${orderId}</strong> ha sido confirmada.</p>
                        
                        <div style="background: #f4f4f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Resumen de Compra</h3>
                            <p><strong>Evento:</strong> ${eventName}</p>
                            <p><strong>Cantidad:</strong> ${tickets.length} entradas</p>
                            <p><strong>Total Pagado:</strong> ${currency} ${total}</p>
                        </div>

                        <p>📍 <strong>Importante:</strong> Puedes ver tus tickets digitales haciendo clic abajo:</p>
                        
                        <a href="https://miboletoni.com/dashboard/tickets" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver mis Tickets</a>
                        
                        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
                        <p style="font-size: 12px; color: #888;">Si tienes dudas, contacta a soporte@miboletoni.com</p>
                    </div>
                `
            });

        } catch (error) {
            console.error('⚠️ Error enviando correo de tickets (pero la orden se guardó):', error);
        }
    }
}

export const ticketService = new TicketService();