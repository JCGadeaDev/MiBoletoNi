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
        
        // 2. Mapeo de Referencias
        const reference = data.custom_reference || data.customReference || data.remote_id;
        const fygaroReference = data.reference || data.id;

        // 3. Análisis de Estado
        const responseMsg = String(data.response_message || data.status || '').toLowerCase();
        
        // --- DETECCIÓN DE REEMBOLSO / VOID ---
        const isVoided = responseMsg.includes('void') || responseMsg.includes('refund');

        if (reference && isVoided) {
             console.log(`🚫 [WEBHOOK] Detectada anulación para: ${reference}`);
             
             const intentRef = adminDb.collection('payment_intents').doc(reference);
             const intentDoc = await intentRef.get();
             
             if (intentDoc.exists && intentDoc.data()?.orderId) {
                 const orderId = intentDoc.data()?.orderId;
                 
                 // Liberar asientos
                 await ticketService.cancelOrder(orderId);
                 
                 await intentRef.update({ 
                     status: 'refunded',
                     updatedAt: FieldValue.serverTimestamp() 
                 });
                 
                 console.log(`✅ [WEBHOOK] Orden ${orderId} reembolsada exitosamente.`);
                 return NextResponse.json({ success: true, message: 'Order refunded' });
             }
             return NextResponse.json({ message: 'Order logic not found for refund' });
        }

        // --- LÓGICA DE ÉXITO (VENTA) ---
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

                return { intentData };
            });

            if (transactionResult === 'NOT_FOUND') return NextResponse.json({ error: 'Not found' }, { status: 404 });
            if (transactionResult === 'ALREADY_DONE') return NextResponse.json({ received: true });

            if (typeof transactionResult === 'object' && transactionResult !== null) {
                const intent = (transactionResult as any).intentData;

                if (!intent || !intent.purchaseData) throw new Error("Datos corruptos");

                // Finalizar compra
                const result = await ticketService.finalizePurchase(
                    intent.userId,
                    intent.purchaseData.presentationId,
                    intent.purchaseData.tickets,
                    intent.purchaseData.type,
                    intent.purchaseData.totalPrice,
                    intent.purchaseData.currency,
                    intent.userPhone || ''
                );

                await intentRef.update({
                    status: 'completed',
                    orderId: result.orderId,
                    updatedAt: FieldValue.serverTimestamp()
                });

                console.log(`✅ [WEBHOOK] ¡ORDEN FINALIZADA! ID: ${result.orderId}`);
                return NextResponse.json({ success: true, orderId: result.orderId });
            }
        }

        return NextResponse.json({ received: true, message: 'Conditions not met' });

    } catch (error: any) {
        console.error('💀 [WEBHOOK] Error crítico:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}