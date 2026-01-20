import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ticketService } from '@/lib/ticket-service';
import jwt from 'jsonwebtoken';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        const outerPayload = JSON.parse(rawBody);
        const secret = process.env.FYGARO_API_SECRET; 

        if (!secret) return NextResponse.json({ error: 'Secret missing' }, { status: 500 });

        // 1. Decodificación
        const data = jwt.verify(outerPayload.jwt, secret) as any;
        
        // 2. Mapeo de Referencias (Capturamos el ID de Firestore que vimos en los logs)
        const reference = data.custom_reference || data.customReference || data.remote_id;
        const fygaroReference = data.reference || data.id;

        // 3. Lógica de Éxito (Si hay referencias y no hay error, es un éxito)
        const responseMsg = String(data.response_message || data.status || '').toLowerCase();
        const isError = responseMsg.includes('error') || responseMsg.includes('declined');
        const isSuccess = (reference && fygaroReference && !isError);

        if (reference && isSuccess) {
            const intentRef = adminDb.collection('payment_intents').doc(reference);

            const transactionResult = await adminDb.runTransaction(async (transaction) => {
                const doc = await transaction.get(intentRef);
                if (!doc.exists) return 'NOT_FOUND';
                
                const intentData = doc.data();
                if (intentData?.status === 'completed') return 'ALREADY_DONE';

                transaction.update(intentRef, { 
                    status: 'processing',
                    fygaroReference: fygaroReference,
                    lastWebhookAt: FieldValue.serverTimestamp(),
                });

                return { intentData }; // Retornamos el objeto con los datos
            });

            // --- SOLUCIÓN AL ERROR DE UNDEFINED ---
            if (typeof transactionResult === 'object' && transactionResult !== null) {
                // Forzamos a TS a entender que intentData existe
                const intent = transactionResult.intentData as any;

                if (!intent || !intent.purchaseData) {
                    throw new Error("Datos de compra no encontrados en el intent");
                }

                // 4. Finalizar compra y generar tickets
                const result = await ticketService.finalizePurchase(
                    intent.userId,
                    intent.purchaseData.presentationId,
                    intent.purchaseData.tickets,
                    intent.purchaseData.type,
                    intent.purchaseData.totalPrice,
                    intent.purchaseData.currency,
                    intent.userPhone || ''
                );

                // 5. Actualizar estado final
                await intentRef.update({
                    status: 'completed',
                    orderId: result.orderId,
                    updatedAt: FieldValue.serverTimestamp()
                });

                console.log(`✅ [WEBHOOK] ¡TRANSACCIÓN COMPLETADA! Orden: ${result.orderId}`);
                return NextResponse.json({ success: true, orderId: result.orderId });
            }

            return NextResponse.json({ message: transactionResult });
        }

        return NextResponse.json({ received: true, message: 'Conditions not met' });

    } catch (error: any) {
        console.error('💀 [WEBHOOK] Error crítico:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}