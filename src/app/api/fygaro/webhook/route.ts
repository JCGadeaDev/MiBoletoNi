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
        if (!secret) return NextResponse.json({ error: 'No Secret' }, { status: 500 });

        // DECODIFICACIÓN
        const data = jwt.verify(outerPayload.jwt, secret) as any;

        // 🔍 LOGS DE DIAGNÓSTICO (Esto es lo que necesitamos ver en Cloud Run)
        console.log('📦 [WEBHOOK DATA] Status recibido:', data.status);
        console.log('📦 [WEBHOOK DATA] Custom Reference:', data.custom_reference);
        console.log('📦 [WEBHOOK DATA] Reference:', data.reference);

        const reference = data.custom_reference || data.reference;
        const status = data.status?.toLowerCase();
        
        // Ajustamos la lista de éxitos por si Fygaro envía algo nuevo
        const isPaid = ['paid', 'approved', 'success', 'completed', 'authorized'].includes(status || '');

        if (isPaid && reference) {
            console.log(`🚀 [WEBHOOK] Iniciando procesamiento para: ${reference}`);
            
            const intentRef = adminDb.collection('payment_intents').doc(reference);
            
            const shouldProcess = await adminDb.runTransaction(async (t) => {
                const doc = await t.get(intentRef);
                if (!doc.exists) return 'NOT_FOUND';
                
                const intentData = doc.data();
                if (intentData?.status === 'completed') return 'ALREADY_DONE';

                t.update(intentRef, { 
                    status: 'processing',
                    lastWebhookAt: FieldValue.serverTimestamp(),
                });
                return { data: intentData };
            });

            if (typeof shouldProcess === 'object') {
                const intent = shouldProcess.data; 
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

                console.log(`✅ [WEBHOOK] ORDEN FINALIZADA: ${result.orderId}`);
                return NextResponse.json({ success: true });
            }
            
            console.log(`ℹ️ [WEBHOOK] Resultado de transacción: ${shouldProcess}`);
            return NextResponse.json({ message: shouldProcess });
        }

        console.warn(`⚠️ [WEBHOOK] Pago no procesado. Status: ${status}, Ref: ${reference}`);
        return NextResponse.json({ received: true, status });

    } catch (error: any) {
        console.error('💀 [WEBHOOK] Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}