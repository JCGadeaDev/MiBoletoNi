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

        // 2. Mapeo Inteligente (Buscamos la orden y el éxito)
        const reference = data.custom_reference || data.customReference || data.remote_id;
        
        // Fygaro usa a veces response_code "00" para éxito o response_message "Approved"
        const responseCode = String(data.response_code || '');
        const responseMsg = String(data.response_message || data.message || '').toLowerCase();
        const statusField = String(data.status || '').toLowerCase();

        // Consideramos éxito si el código es 00 O si el mensaje dice aprobado/success
        const isSuccess = 
            responseCode === '00' || 
            responseMsg.includes('approved') || 
            responseMsg.includes('success') ||
            statusField.includes('approved') ||
            statusField.includes('paid');

        console.log(`🔎 [DEBUG] Ref: ${reference}, Code: ${responseCode}, Msg: ${responseMsg}, IsSuccess: ${isSuccess}`);

        if (reference && isSuccess) {
            console.log(`🚀 [WEBHOOK] Procesando orden aprobada: ${reference}`);
            
            const intentRef = adminDb.collection('payment_intents').doc(reference);

            // Usamos una transacción para asegurar que no se procese dos veces
            const transactionResult = await adminDb.runTransaction(async (transaction) => {
                const doc = await transaction.get(intentRef);
                if (!doc.exists) return 'NOT_FOUND';
                
                const intentData = doc.data();
                if (intentData?.status === 'completed') return 'ALREADY_DONE';

                // Marcamos como procesando
                transaction.update(intentRef, { 
                    status: 'processing',
                    fygaroReference: data.reference, // Guardamos el O-YWKJ...
                    lastWebhookAt: FieldValue.serverTimestamp(),
                });

                return { intentData };
            });

            if (typeof transactionResult === 'object') {
                const intent = transactionResult.intentData;

                // 3. Generar los boletos finales
                const result = await ticketService.finalizePurchase(
                    intent.userId,
                    intent.purchaseData.presentationId,
                    intent.purchaseData.tickets,
                    intent.purchaseData.type,
                    intent.purchaseData.totalPrice,
                    intent.purchaseData.currency,
                    intent.userPhone || ''
                );

                // 4. Finalizar la orden
                await intentRef.update({
                    status: 'completed',
                    orderId: result.orderId,
                    updatedAt: FieldValue.serverTimestamp()
                });

                console.log(`✅ [WEBHOOK] ¡ORDEN FINALIZADA! ID: ${result.orderId}`);
                return NextResponse.json({ success: true });
            }

            return NextResponse.json({ message: transactionResult });
        }

        console.warn('⚠️ [WEBHOOK] No se cumplieron las condiciones de éxito:', { reference, isSuccess });
        return NextResponse.json({ received: true, error: 'Payment not approved or reference missing' });

    } catch (error: any) {
        console.error('💀 [WEBHOOK] Error crítico:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}